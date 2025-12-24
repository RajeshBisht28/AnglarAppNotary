import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { SHARED_IMPORTS } from 'src/app/shared';
import { AuthService, NotificationService } from 'src/app/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'notary-signup',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
signupForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      aliasName: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      company: [''],
      jobTitle: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      avConsent: [false, Validators.requiredTrue]
    },
      { validators: this.passwordMatchValidator }
    );
  }

  get email() { return this.signupForm.get('email'); }
  get aliasName() { return this.signupForm.get('aliasName'); }
  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }
  get avConsent() {
  return this.signupForm.get('avConsent');
}


   passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.authService.signupUser(this.signupForm.value).subscribe({
        next: res => {
          this.loading = false;
          if (res.status ==="0") this.notificationService.showSuccess("Please check your email to activate your account.");
          if (res.status ==="1") this.notificationService.showError(res.message)
        }
      });
    }
  }
}
