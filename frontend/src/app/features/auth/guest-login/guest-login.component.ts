import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, NotificationService } from 'src/app/core';
import { User } from 'src/app/models/auth.models';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'guest-login',
  templateUrl: './guest-login.component.html',
  styleUrls: ['./guest-login.component.scss']
})
export class GuestLoginComponent implements OnInit {
  loading = false;
  packageId: string = '';
  signerId: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.packageId = params['packageId'];
      this.signerId = params['signerId'];
      this.loginAsGuest();
    });
  }

  private loginAsGuest(): void {
    if (!this.packageId || !this.signerId) {
      this.notificationService.showError('Invalid package or signer information');
      return;
    }

    this.loading = true;

    this.authService.loginGuest(this.signerId).subscribe({
      next: (res: User) => {
        this.loading = false;

        if (res.status === 'error') {
          this.notificationService.showError(res.message || 'Guest login failed');
          return;
        }

        if (res.status === 'ok') {
          this.router.navigate([
            '/video-session/package',
            this.packageId,
            'signer',
            this.signerId
          ]);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Guest login error:', err);
        this.notificationService.showError('Something went wrong. Please try again.');
      },
    });
  }
}
