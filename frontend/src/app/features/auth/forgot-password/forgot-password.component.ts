import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, NotificationService } from 'src/app/core'
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from 'src/app/shared';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  success = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.forgotForm.get('email'); }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.loading = true;

    const email = this.forgotForm.value.email;

    this.authService.sendForgotPasswordLink({ email }).subscribe({
      next: (data: any) => {
        if (data.status) {
          this.success = true;
          this.loading = false;
        } else {
          this.notificationService.showError("Failed to send reset link. Please try again.");
          this.loading = false;
        }

      },
      error: () => {
        this.notificationService.showError("Failed to send reset link. Please try again.");
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

}