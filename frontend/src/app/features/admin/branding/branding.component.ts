import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandingApiService, BrandingConfig } from 'src/app/core/services/business/branding-api.service';
import { LoadingComponent, MATERIAL_IMPORTS } from 'src/app/shared';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from 'src/app/core';

export interface Account {
  id: number;
  name: string;
}

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_IMPORTS, LoadingComponent],
  templateUrl: './branding.component.html',
  styleUrls: ['./branding.component.scss']
})
export class BrandingComponent implements OnInit {
  brandingForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  selectedAccountId: number | null = null;
  accounts: Account[] = [];
  previewBranding: BrandingConfig | null = null;
  accountsLoading = true;

  constructor(
    private fb: FormBuilder,
    private brandingApiService: BrandingApiService,
    private adminApiService: AdminApiService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  private initializeForm(): void {
    this.brandingForm = this.fb.group({
      mainLogo: [''],
      platformName: ['', [Validators.required]],
      bannerBackgroundColor: ['#1976d2', [Validators.required]],
      bannerTextColor: ['#ffffff', [Validators.required]],
      actionButtonBackgroundColor: ['#f57c00', [Validators.required]],
      actionButtonTextColor: ['#ffffff', [Validators.required]],
      primaryButtonsBackgroundColor: ['#4caf50', [Validators.required]],
      primaryButtonsTextColor: ['#ffffff', [Validators.required]]
    });

    this.brandingForm.valueChanges.subscribe(() => {
      this.updatePreview();
    });
  }

  private loadAccounts(): void {
    this.accountsLoading = true;
    this.adminApiService.getAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res || [];
        this.accountsLoading = false;
      },
      error: () => {
        this.accountsLoading = false;
        this.showMessage('Failed to load accounts', 'error');
      }
    });
  }

  onAccountSelect(accountId: number): void {
    this.selectedAccountId = accountId;
    this.loadBrandingConfig(accountId);
  }

  private loadBrandingConfig(accountId: number): void {
    this.isLoading = true;
    this.brandingApiService.getBranding(accountId).subscribe({
      next: (config: BrandingConfig) => {
        this.brandingForm.patchValue(config);
        this.previewBranding = config;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showMessage('Failed to load branding configuration', 'error');
      }
    });
  }

  private updatePreview(): void {
    this.previewBranding = this.brandingForm.value;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const logo = e.target.result.replace(/^data:image\/[a-z]+;base64,/, '');
        this.brandingForm.patchValue({
          mainLogo: logo
        });
      };
      reader.readAsDataURL(file);
    }
  }

  saveBrandingConfig(): void {
    if (!this.selectedAccountId) {
      this.showMessage('Please select an account', 'error');
      return;
    }

    if (this.brandingForm.invalid) {
      this.showMessage('Please fill in all required fields', 'error');
      return;
    }

    this.isSaving = true;
    const brandingData: BrandingConfig = { ...this.brandingForm.value };

    this.brandingApiService.updateBranding(this.selectedAccountId, brandingData).subscribe({
      next: () => {
        this.isSaving = false;
        this.showMessage('Branding saved successfully', 'success');
      },
      error: () => {
        this.isSaving = false;
        this.showMessage('Failed to save branding', 'error');
      }
    });
  }

  resetForm(): void {
    if (this.selectedAccountId) {
      this.loadBrandingConfig(this.selectedAccountId);
    }
  }

  getCurrentAccountName(): string {
    const account = this.accounts.find(a => a.id === this.selectedAccountId);
    return account?.name || 'Account';
  }

  private showMessage(message: string, type: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [type === 'success' ? 'success-snackbar' : 'error-snackbar']
    });
  }
}
