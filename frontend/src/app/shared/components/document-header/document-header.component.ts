import { Component, computed, inject, Signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SHARED_IMPORTS } from '../../material';
import { User } from 'src/app/models/auth.models';
import { BrandingApiService, BrandingConfig } from 'src/app/core';
import { StepService } from 'src/app/features/document/service';


@Component({
  selector: 'document-header',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './document-header.component.html',
  styleUrls: ['./document-header.component.scss']
})
export class DocumentHeaderComponent implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);
  private brandingApi = inject<BrandingApiService>(BrandingApiService);
  private saveForLaterService = inject(StepService)

  user: Signal<User | undefined> = computed(() => this.auth.getUser());

  configData: BrandingConfig | null = null;

  ngOnInit() {
    this.loadBranding();
  }

  loadBranding() {
    const u = this.user();

    if (!u?.accountId) return;

    this.brandingApi.getBranding(u.accountId).subscribe({
      next: (config: BrandingConfig) => {
        this.configData = config;
        console.log("Branding Loaded:", config);
      },
      error: () => console.error("Branding API failed.")
    });
  }

  get initials(): string {
    const u: any = this.user();
    if (!u) return 'U';
    const first = (u.firstName || u.userName || '').trim();
    const last = (u.LastName || '').trim();
    const f = first ? first[0] : '';
    const l = last ? last[0] : '';
    return `${f}${l}`.trim().toUpperCase() || 'U';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  saveForLater() {
    this.saveForLaterService.saveForLaterSignal.set(true);
  }
}
