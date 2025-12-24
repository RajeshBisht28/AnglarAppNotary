import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { Document, Page } from 'src/app/models/package.model';

@Component({
  selector: 'document-thumbnails',
  standalone: true,
  imports: [CommonModule, MatListModule, MatCardModule],
  templateUrl: './document-thumbnails.component.html',
  styleUrls: ['./document-thumbnails.component.scss']
})
export class DocumentThumbnailsComponent {
  @Input() documents: Document[] = [];
  @Output() select = new EventEmitter<{ documentId: number; pageNumber: number }>();

  onSelect(docId: number, page: Page) {
    this.select.emit({ documentId: docId, pageNumber: page.pageNumber });
  }
}
