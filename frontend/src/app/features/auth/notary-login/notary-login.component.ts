import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, NotificationService } from 'src/app/core';
import { Router, RouterModule } from '@angular/router';
import { User } from 'src/app/models/auth.models';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-notary-login',
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterModule],
  templateUrl: './notary-login.component.html',
  styleUrls: ['./notary-login.component.scss']
})
export class NotaryLoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password, remember } = this.loginForm.value;

    this.authService.loginNotaryUser({ email, password, remember }).subscribe({
      next: (res: User) => {
        this.loading = false;

        if (res.status === 'error') {
          this.notificationService.showError(res.message || 'Login failed');
          return;
        }

        if (res.status === 'ok') {
          this.router.navigate(['/notary-user/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
      },
    });
  }


  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}

