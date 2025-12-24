import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DynamicDialogComponent, DynamicDialogConfig } from './dynamic-dialog.component';

@Injectable({ providedIn: 'root' })
export class DynamicDialogService {
  constructor(private dialog: MatDialog) {}

  open<T = any>(config: DynamicDialogConfig<T>, dialogConfig?: MatDialogConfig) {
    return this.dialog.open<DynamicDialogComponent<T>, DynamicDialogConfig<T>, T>(DynamicDialogComponent, {
      width: '560px',
      autoFocus: false,
      disableClose: true,
      ...dialogConfig,
      data: config
    }).afterClosed();
  }
}



