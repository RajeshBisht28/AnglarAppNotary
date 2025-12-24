import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_IMPORTS } from '../../material/material-imports';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize, isObservable, Observable, of } from 'rxjs';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';

export interface EmailAssignDialogConfig {
  packageId: string;
  packageUrl: string;
}

@Component({
  selector: 'app-email-assign-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_IMPORTS],
  templateUrl: './email-assign-dialog.component.html',
  styleUrls: ['./email-assign-dialog.component.scss']
})
export class EmailAssignDialogComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmailAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: EmailAssignDialogConfig,
    private notification: NotificationService,
    private packageService: PackageApiService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  close(): void {
    this.dialogRef.close(undefined);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.showError('Please enter a valid email address');
      return;
    }

    this.isSubmitting = true;
    const email = this.form.get('email')?.value;

    const request = {
      email,
      packageUrl: this.config.packageUrl,
      packageId: this.config.packageId
    };

    this.packageService.sendPackageLink(request).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (result: any) => {
        if (result?.status === false) {
          this.notification.showError(result.message || 'Failed to send package link');
          return;
        }
        this.notification.showSuccess('Package link sent successfully');
        this.dialogRef.close({ success: true });
      },
      error: (err: any) => {
        const message = err?.error?.message || err?.message || 'Failed to send package link';
        this.notification.showError(message);
      }
    });
  }
}
