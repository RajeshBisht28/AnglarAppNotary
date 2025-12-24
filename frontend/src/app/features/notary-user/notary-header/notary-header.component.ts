import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { AuthService, BrandingApiService, BrandingConfig } from 'src/app/core';

@Component({
  selector: 'app-notary-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './notary-header.component.html',
  styleUrls: ['./notary-header.component.scss']
})
export class NotaryHeaderComponent {

  user: any;
  configData?: BrandingConfig
  
  constructor(public authService: AuthService,
    private brandingApiService: BrandingApiService
  ) {
    this.user = authService.getUser();
    this.getBranding();
  }

  navLinks = [
    { label: 'Dashboard', link: '/notary-user/dashboard' },
    { label: 'Documents', link: '/notary-user/documents' },
    { label: 'Clients', link: '/notary-user/clients' },
    { label: 'Appointments', link: '/notary-user/appointments' },
    { label: 'Journal', link: '/notary-user/journal' },
    { label: 'Billing', link: '/notary-user/billing' },
  ];

  private auth = inject(AuthService);
  private router = inject(Router);
  

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  getBranding() {
      this.brandingApiService.getBranding(this.user.accountId).subscribe({
        next: (config: BrandingConfig) => {
           this.configData = config;
        }
      });
    }
}
