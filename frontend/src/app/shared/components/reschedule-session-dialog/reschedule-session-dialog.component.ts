import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SHARED_IMPORTS } from 'src/app/shared';
import { AuthService } from 'src/app/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { finalize } from 'rxjs';

export interface RescheduleSessionData {
  packageId: string;
  packageName: string;
  currentDateTime?: string;
  onReschedule: (date: string, time: string) => any;
}

@Component({
  selector: 'app-reschedule-session-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...SHARED_IMPORTS],
  templateUrl: './reschedule-session-dialog.component.html',
  styleUrls: ['./reschedule-session-dialog.component.scss']
})
export class RescheduleSessionDialogComponent implements OnInit {
  form = this.fb.group({
    date: [null as Date | null, Validators.required],
    time: ['', Validators.required]
  });

  today = new Date();
  minDateTime = new Date();
  isSubmitting = false;
  user: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RescheduleSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RescheduleSessionData,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.minDateTime.setHours(0, 0, 0, 0);
  }

  close(): void {
    this.dialogRef.close(undefined);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showError('Please select both date and time');
      return;
    }

    this.isSubmitting = true;
    const { date, time } = this.form.value;
    const formattedDate = this.formatDate(date as Date);

    const result = this.data.onReschedule(formattedDate, time as string);
    const observable = result.pipe ? result : Promise.resolve(result);

    observable.pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Session rescheduled successfully');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        const message = err?.error?.message || err?.message || 'Failed to reschedule session';
        this.notificationService.showError(message);
      }
    });
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
