import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AccountVerificationSuccessComponent } from './account-verification-success/account-verification-success.component';
import { SignupComponent } from './signup/signup.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentFailureComponent } from './payment-failure/payment-failure.component';
import { NotaryLoginComponent } from './notary-login/notary-login.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ForgotPassNotaryComponent } from './forgot-pass-notary/forgot-pass-notary.component';
import { SetPassNotaryComponent } from './set-pass-notary/set-pass-notary.component';
import { GuestLoginComponent } from './guest-login/guest-login.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'set-password', component: SetPasswordComponent },
      { path: 'success', component: AccountVerificationSuccessComponent },
      { path: 'signup', component: SignupComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  {
    path: 'user/:userId/package/:packageId/payment-success',
    component: PaymentSuccessComponent
  },
  {
    path: 'user/:userId/package/:packageId/payment-fail',
    component: PaymentFailureComponent
  },
  { path: 'notary-login',
    component: NotaryLoginComponent
  },
  { path: 'notary-forgot-password',
    component: ForgotPassNotaryComponent
  },
  { path: 'set-notary-password',
    component: SetPassNotaryComponent
  },
  {
    path: 'join-video-session/package/:packageId/signer/:signerId',
    component: GuestLoginComponent
  }
];
