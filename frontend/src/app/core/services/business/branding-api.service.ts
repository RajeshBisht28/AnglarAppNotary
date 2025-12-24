import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface BrandingConfig {
  mainLogo: string | null;
  bannerBackgroundColor: string;
  bannerTextColor: string;
  actionButtonBackgroundColor: string;
  actionButtonTextColor: string;
  primaryButtonsBackgroundColor: string;
  primaryButtonsTextColor: string;
  platformName: string
}

@Injectable({
  providedIn: 'root'
})
export class BrandingApiService {

  private BASE_URL = environment.API_URL + environment.API_PATH;

  constructor(private http: HttpClient) { }

  getBranding(accountId: number): Observable<BrandingConfig> {
    const url = `${this.BASE_URL}/eNotary/accounts/${accountId}/branding`;
    return this.http.get<BrandingConfig>(url);
  }

  updateBranding(accountId: number, branding: BrandingConfig): Observable<BrandingConfig> {
    const url = `${this.BASE_URL}/eNotary/accounts/${accountId}/branding`;
    return this.http.post<BrandingConfig>(url, branding);
  }
}
