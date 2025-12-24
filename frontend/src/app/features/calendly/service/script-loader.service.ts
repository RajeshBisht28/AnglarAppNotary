import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {

private loaded = false;

  loadCalendlyScript(): Promise<void> {
    if (this.loaded) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      // Guard: if script already present in DOM (maybe preloaded), detect it
      const existing = document.querySelector('script[data-calendly="widget"]') as HTMLScriptElement | null;
      if (existing) {
        existing.onload ? existing.onload = () => { this.loaded = true; resolve(); } : resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.setAttribute('data-calendly', 'widget');
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }
}
