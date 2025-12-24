import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { parseExtractedData, formatExtractedDataForDisplay } from 'src/app/utils/extract-data-parser';

@Component({
  selector: 'extracted-data-display',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './extracted-data-display.component.html',
  styleUrls: ['./extracted-data-display.component.scss']
})
export class ExtractedDataDisplayComponent {
  @Input() extractedDataString: string | null = null;
  @Input() isVerified: boolean = false;

  get parsedData(): Array<{ label: string; value: string }> {
    const data = parseExtractedData(this.extractedDataString);
    if (!data) {
      return [];
    }
    return formatExtractedDataForDisplay(data);
  }

  get hasData(): boolean {
    return this.parsedData.length > 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVerified']) {
      console.log('isVerified changed:', this.isVerified);
    }
  }
}
