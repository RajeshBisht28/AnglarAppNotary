import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SHARED_IMPORTS } from 'src/app/shared';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';

export type SignatureDialogType = 'Signature' | 'Initial';

export interface SignatureDialogData {
  packageId: string;
  signerId: number;
  fieldType: SignatureDialogType;
  signerName?: string;
  existing?: string | null;
}

@Component({
  selector: 'app-signature-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTabsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, ...SHARED_IMPORTS],
  templateUrl: './signature-dialog.component.html',
  styleUrls: ['./signature-dialog.component.scss']
})
export class SignatureDialogComponent {
  loading = true;
  apiSignature?: string; // base64 (no prefix)
  apiInitials?: string; // base64 (no prefix)

  // draw
  @ViewChild('drawCanvas') drawCanvas?: ElementRef<HTMLCanvasElement>;
  drawing = false;
  private ctx?: CanvasRenderingContext2D | null;

  // type
  typedName = '';
  typedInitials = '';
  typeSignatures: { index: number; base64: string }[] = [];
  typeLoadingSignatures = false;

  // selection
  selectedDataUrl?: string; // full data url

  activeTabIndex = 0;

  constructor(
    private api: PackageApiService,
    private dialogRef: MatDialogRef<SignatureDialogComponent, string | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: SignatureDialogData,
  ) {
    this.typedName = data.signerName || '';
    this.typedInitials = this.getInitials(this.typedName);
  }

  ngOnInit(): void {
    this.fetchFromApi();
    this.fetchTypeSignatures();
  }

  ngAfterViewInit() {
    // initialize if Draw tab is default open
    if (this.activeTabIndex === 1) {
      setTimeout(() => this.initCanvas());
    }
  }

  private fetchFromApi() {
    this.loading = true;
    this.api.signForSigner(this.data.packageId, this.data.signerId).subscribe({
      next: (res) => {
        this.apiSignature = res?.signature || '';
        this.apiInitials = res?.initials || '';
        if (!this.typedName && res?.signerName) {
          this.typedName = res.signerName;
          this.typedInitials = this.getInitials(this.typedName);
        }
        const start = this.data.fieldType === 'Initial' ? this.apiInitials : this.apiSignature;
        if (start) {
          this.selectedDataUrl = this.base64ToDataUrl(start);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // drawing
  private initCanvas() {
    if (!this.drawCanvas) return;
    const canvas = this.drawCanvas.nativeElement;

    // ensure visible width
    const cssWidth = Math.max(canvas.clientWidth, 600);
    const cssHeight = 160;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';

    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      if (ratio !== 1) this.ctx.scale(ratio, ratio);
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = '#000';
    }
  }

  startDraw(event: PointerEvent) {
    if (!this.ctx || !this.drawCanvas) return;
    event.preventDefault();
    this.drawing = true;
    this.ctx.beginPath();
    const { x, y } = this.getLocalPos(event);
    this.ctx.moveTo(x, y);
    this.drawCanvas.nativeElement.setPointerCapture(event.pointerId);
  }

  drawMove(event: PointerEvent) {
    if (!this.drawing || !this.ctx) return;
    event.preventDefault();
    const { x, y } = this.getLocalPos(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  endDraw(event: PointerEvent) {
    if (!this.drawing || !this.ctx || !this.drawCanvas) return;
    event.preventDefault();
    this.drawing = false;
    try { this.drawCanvas.nativeElement.releasePointerCapture(event.pointerId); } catch {}
    this.selectedDataUrl = this.drawCanvas.nativeElement.toDataURL('image/png');
  }

  clearDraw() {
    if (!this.ctx || !this.drawCanvas) return;
    const canvas = this.drawCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.selectedDataUrl = undefined;
  }

  private getLocalPos(event: PointerEvent) {
    const rect = this.drawCanvas!.nativeElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  // type and styles

  onInputChange(value: string) {
    if (this.data.fieldType === 'Initial') {
      this.typedInitials = value || '';
    } else {
      this.typedName = value || '';
    }
    this.fetchTypeSignatures();
  }

  private fetchTypeSignatures() {
    const signerName = this.data.fieldType === 'Initial' ? this.typedInitials : this.typedName;
    const imageType = this.data.fieldType === 'Initial' ? 'initial' : 'signature';
    const initialName = this.data.fieldType === 'Initial' ? this.typedInitials : '';

    if (!signerName) {
      this.typeSignatures = [];
      this.selectedDataUrl = undefined;
      return;
    }

    this.typeLoadingSignatures = true;
    this.api.getSignature(signerName, imageType, initialName).subscribe({
      next: (res) => {
        this.typeLoadingSignatures = false;
        this.typeSignatures = [];

        if (res?.signImage && Array.isArray(res.signImage)) {
          this.typeSignatures = res.signImage.map((item: any, index: number) => ({
            index,
            base64: item.signImage64 || ''
          })).filter((s: { base64: any; }) => s.base64);

          if (this.typeSignatures.length > 0) {
            this.selectSignatureStyle(0);
          }
        }
      },
      error: () => {
        this.typeLoadingSignatures = false;
        this.typeSignatures = [];
      }
    });
  }

  selectSignatureStyle(index: number) {
    const style = this.typeSignatures[index];
    if (style) {
      this.selectedDataUrl = this.base64ToDataUrl(style.base64);
    }
  }

  getInitials(name: string) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  // helpers
  base64ToDataUrl(b64: string) {
    return `data:image/png;base64,${b64}`;
  }
  dataUrlToBase64(url?: string) {
    if (!url) return '';
    const idx = url.indexOf('base64,');
    return idx >= 0 ? url.substring(idx + 7) : url;
  }

  onTabIndexChange(index: number) {
    this.activeTabIndex = index;
    if (index === 1) {
      setTimeout(() => this.initCanvas());
    }
  }

  useSelection() {
    if (!this.selectedDataUrl) return;
    const b64 = this.dataUrlToBase64(this.selectedDataUrl);
    this.dialogRef.close(b64);
  }

  close() {
    this.dialogRef.close(undefined);
  }
}
