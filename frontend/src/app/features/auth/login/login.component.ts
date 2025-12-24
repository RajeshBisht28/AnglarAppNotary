import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, NotificationService } from 'src/app/core';
import { User } from 'src/app/models/auth.models';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterModule],
  selector: 'notary-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
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

  this.authService.loginEndUser({ email, password, remember }).subscribe({
    next: (res: User) => {
      this.loading = false;

      if (res.status === 'error') {
        this.notificationService.showError(res.message || 'Login failed');
        return;
      }
      if (res.status === 'ok') {
        const role = res.role;

        if (role === 'RU') {
          this.router.navigate(['/user/dashboard']);
        } else if (role === 'SA') {
          this.router.navigate(['/admin/accounts']);
        } else {
         // this.router.navigate(['/unauthorized']);
        }
      }
    },
    error: (err) => {
      this.loading = false;
      console.error('Login error:', err);
      this.notificationService.showError('Something went wrong. Please try again.');
    },
  });
}



  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
