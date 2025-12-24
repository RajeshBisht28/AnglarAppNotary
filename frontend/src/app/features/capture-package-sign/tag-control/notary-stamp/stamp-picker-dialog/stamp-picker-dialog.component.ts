import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_IMPORTS } from 'src/app/shared/material/material-imports';
import { NotarizationApiService } from 'src/app/core/services/business/notarization-api.service';
import { NotificationService } from 'src/app/core/services/notification.service';

export interface StampPickerData {
  selectedStampBase64?: string | null;
}

@Component({
  selector: 'app-stamp-picker-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ...MATERIAL_IMPORTS],
  templateUrl: './stamp-picker-dialog.component.html',
  styleUrls: ['./stamp-picker-dialog.component.scss']
})
export class StampPickerDialogComponent {
  sealsBase64: string[] = [];
  loading = true;
  error: string | null = null;
  chosenIndex: number | null = null;

  constructor(
    private api: NotarizationApiService,
    private dialogRef: MatDialogRef<StampPickerDialogComponent, string | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: StampPickerData,
    private notify: NotificationService
  ) {
    this.loadSeals();
  }

  private loadSeals(): void {
    this.loading = true;
    // this.api.getSeals().subscribe({
    //   next: (seals) => {
    //     console.log(seals)
    //     this.sealsBase64 = Array.isArray(seals) ? seals : [];
    //     if (this.data?.selectedStampBase64) {
    //       const pure = this.stripDataUrlPrefix(this.data.selectedStampBase64);
    //       const idx = this.sealsBase64.findIndex(b64 => b64 === pure);
    //       if (idx >= 0) this.chosenIndex = idx;
    //     }
    //     this.loading = false;
    //   }
    // });
    this.api.getSeals().subscribe({
      next: (seals) => {
        this.sealsBase64 = Array.isArray(seals) ? seals : [];
        this.loading = false;
      },
    });

  }

  select(index: number): void {
    this.chosenIndex = index;
  }

  isSelected(index: number): boolean {
    return this.chosenIndex === index;
  }

  useSelected(): void {
    if (this.chosenIndex === null || this.chosenIndex < 0 || this.chosenIndex >= this.sealsBase64.length) {
      this.notify.showError('Please select a stamp');
      return;
    }
    const dataUrl = this.toDataUrl(this.sealsBase64[this.chosenIndex]);
    this.dialogRef.close(dataUrl);
  }

  close(): void {
    this.dialogRef.close(undefined);
  }

  private toDataUrl(base64: string): string {
   // return `data:image/png;base64,${base64}`;
   return base64;
  }

  private stripDataUrlPrefix(dataUrl: string): string {
    const idx = dataUrl.indexOf('base64,');
    return idx >= 0 ? dataUrl.substring(idx + 7) : dataUrl;
  }
}
