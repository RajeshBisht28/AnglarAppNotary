import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTagComponent } from '../../abstract-base-tag';
import { SHARED_IMPORTS } from 'src/app/shared';
import { MatDialog } from '@angular/material/dialog';
import { StampPickerDialogComponent } from './stamp-picker-dialog/stamp-picker-dialog.component';
import { CaptureSignService } from '../../capture-sign.service';

@Component({
  selector: 'app-notary-stamp',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS],
  templateUrl: './notary-stamp.component.html',
  styleUrls: ['./notary-stamp.component.scss']
})
export class NotaryStampComponent extends BaseTagComponent {

  constructor(
    elRef: ElementRef,
    protected override signerService: CaptureSignService,
    private dialog: MatDialog
  ) {
    super(elRef, signerService);
  }

  openStampDialog() {
    const current = this.field?.value as string | undefined;
    this.dialog.open<StampPickerDialogComponent, { selectedStampBase64?: string | null }, string | undefined>(
      StampPickerDialogComponent,
      {
        width: '680px',
        autoFocus: false,
        disableClose: true,
        data: { selectedStampBase64: current || null }
      }
    ).afterClosed().subscribe((result) => {
      if (result) {
        this.setDataChange(result);
      }
    });
  }
}
