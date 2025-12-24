import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-calendly-iframe',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS],
  templateUrl: './calendly-iframe.component.html',
  styleUrls: ['./calendly-iframe.component.scss']
})
export class CalendlyIframeComponent implements OnInit {
  safeUrl?: SafeResourceUrl;
  loading = true;
  error?: string;

  @Input() packageId!: string

  constructor(
    private api: PackageApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.api.getCalendlyUrl(this.packageId).subscribe({
      next: (res: { calendlyScheduleLink: string; }) => {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.calendlyScheduleLink);
        this.loading = false;
      },
    });
  }
}
