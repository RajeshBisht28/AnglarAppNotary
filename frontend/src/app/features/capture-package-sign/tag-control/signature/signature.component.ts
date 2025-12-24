import { Component, Input, inject } from '@angular/core';
import { BaseTagComponent } from '../../abstract-base-tag';
import { SHARED_IMPORTS } from 'src/app/shared';
import { MatDialog } from '@angular/material/dialog';
import { SignatureDialogComponent } from './signature-dialog/signature-dialog.component';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent extends BaseTagComponent{
  @Input() packageId!: string;

  private dialog = inject(MatDialog);

  openSignatureDialog() {
    if (!this.packageId || !this.field) return;

    if (!this.checkSessionJoined()) {
      return;
    }
    const signerId = this.field.recipientId || 0;
    const dialogRef = this.dialog.open(SignatureDialogComponent, {
      width: '720px',
      data: {
        packageId: this.packageId,
        signerId,
        fieldType: this.field.type === 'Initial' ? 'Initial' : 'Signature',
        signerName: this.field.signerName,
        existing: this.field.value || null,
      },
      panelClass: 'signature-dialog-panel'
    });

    dialogRef.afterClosed().subscribe((b64?: string) => {
      if (b64) {
        this.setDataChange(b64);
      }
    });
  }
}
