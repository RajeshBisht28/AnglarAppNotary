import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptLoaderService } from '../service/script-loader.service';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { SHARED_IMPORTS } from 'src/app/shared';

declare global {
  interface Window {
    Calendly: any;
  }
}


@Component({
  selector: 'app-calendly-widget',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS],
  templateUrl: './calendly-widget.component.html',
  styleUrls: ['./calendly-widget.component.scss']
})
export class CalendlyWidgetComponent implements OnInit {
  @ViewChild('inlineContainer', { static: true }) inlineContainer!: ElementRef<HTMLDivElement>;

  @Input() packageId!: string

  url = '';
  loading = true;
  error?: string;

  constructor(
    private api: PackageApiService,
    private loader: ScriptLoaderService
  ) {}

  ngOnInit() {
    this.api.getCalendlyUrl(this.packageId).subscribe({
      next: async (res: { calendlyScheduleLink: string; }) => {
        this.url = res.calendlyScheduleLink;
        try {
          await this.loader.loadCalendlyScript();
          this.initInlineWidget();
        } catch (e) {
          // fallback to iframe if script fails to load
          this.renderFallbackIframe();
        } finally {
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Could not get booking URL';
        this.loading = false;
      }
    });
  }

  private initInlineWidget() {
    if (window.Calendly?.initInlineWidget) {
      window.Calendly.initInlineWidget({
        url: this.url,
        parentElement: this.inlineContainer.nativeElement,
        prefill: {}, // optionally set from backend or inputs
        utm: {}
      });
    } else {
      // If Calendly object not available despite script load — fallback
      this.renderFallbackIframe();
    }
  }

  private renderFallbackIframe() {
    if (!this.inlineContainer) return;
    const iframe = document.createElement('iframe');
    iframe.src = this.url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.frameBorder = '0';
    this.inlineContainer.nativeElement.innerHTML = '';
    this.inlineContainer.nativeElement.appendChild(iframe);
  }
}