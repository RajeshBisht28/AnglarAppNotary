import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { AuthService, BrandingApiService, BrandingConfig } from 'src/app/core';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent {
  user: any;
  configData?: BrandingConfig

  constructor(public authService: AuthService,
    private router: Router,
    private brandingApiService: BrandingApiService
  ) {
    this.user = this.authService.getUser();
    this.getBranding();
  }

  logout(): void {
    this.authService.logout();
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
