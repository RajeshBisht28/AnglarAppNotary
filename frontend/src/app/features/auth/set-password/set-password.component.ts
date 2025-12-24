import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, NotificationService } from 'src/app/core';
import { SHARED_IMPORTS } from 'src/app/shared';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  imports: [...SHARED_IMPORTS],
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent {

  hide1 = true;
  hide2 = true;
  loading = false;
  success = false;
  lnuid: string | null = null;
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router

  ) {
    this.lnuid = this.activatedRoute.snapshot.queryParamMap.get('LNUID');
    this.email = this.activatedRoute.snapshot.queryParamMap.get('email');
  }

  passwordForm = this.fb.nonNullable.group(
    {
      password: this.fb.nonNullable.control('', {
        validators: [Validators.required, Validators.minLength(6)]
      }),
      confirmPassword: this.fb.nonNullable.control('', {
        validators: [Validators.required]
      })
    },
    {
      validators: (form) => this.passwordMatchValidator(form)
    }
  );

  passwordMatchValidator(form: any) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  get password() {
    return this.passwordForm.get('password');
  }
  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

  goToLogin() {
  this.router.navigate(['/auth/login']);
}

  onSubmit() {
    if (this.passwordForm.invalid) return;
    this.loading = true;
    this.authService.setPassword({
      password: this.password?.value!,
      id: this.lnuid!
    }).subscribe({
      next: (data: any) => {
        if (data.status) {
          this.loading = false;
          this.success = true;
          this.notificationService.showSuccess("Password set successfully!");
        } else {
          this.loading = false;
          this.notificationService.showError("Failed to set password. Please try again.");
        }
      },
      error: () => {
        this.loading = false;
        this.notificationService.showError("Failed to set password. Please try again.");
      }
    });
  }
}
