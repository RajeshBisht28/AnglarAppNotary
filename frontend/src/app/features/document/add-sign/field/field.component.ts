import { AfterViewInit, Component, ElementRef, HostBinding, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FieldInfo } from 'src/app/models/signer.model';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-field',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent implements AfterViewInit {
  public droppedElement: any;

  @ViewChild('dragField')
  public divField!: ElementRef<HTMLDivElement>;

  @HostBinding('style.display') display: string = 'block';

  public field?: FieldInfo | undefined;

  tagUpdateSubscription!: Subscription;

  constructor() { }

  ngAfterViewInit() {
    if (this.field?.tabId) {
      this.setPositionFromField();
    } else {
      this.setPosition();
    }
  }

  dragEnded = () => {
    this.updateFieldPosition();
  };

  private updateFieldPosition = () => {
    if (this.field) {
      const pageDiv = document.querySelector(
        `#d${this.field.documentId}p${this.field.pageNumber}`
      );
      if (pageDiv) {
        const pageBound = pageDiv.getBoundingClientRect();
        const divBound = this.divField.nativeElement.getBoundingClientRect();
        const pageHeight = pageDiv.getAttribute('page-height');
        const pageWidth = pageDiv.getAttribute('page-width');
        if (pageHeight && pageWidth) {
          this.field.xPosition =
            (divBound.x - pageBound.x) *
            (parseInt(pageWidth, 10) / pageBound.width);
          this.field.yPosition =
            (divBound.y - pageBound.y) *
            (parseInt(pageHeight, 10) / pageBound.height);
        }
      }
    }
  };

  setPosition = () => {
    const nativeBound = this.divField.nativeElement.getBoundingClientRect();

    if (this.droppedElement) {
      const shiftX = this.droppedElement.clientX - this.droppedElement.offsetX;
      const shiftY = this.droppedElement.clientY - this.droppedElement.offsetY;

      const x = this.droppedElement.pageX - shiftX - nativeBound.width / 2;
      const y = this.droppedElement.pageY - shiftY - nativeBound.height / 2;

      this.divField.nativeElement.style.left = `${x}px`;
      this.divField.nativeElement.style.top = `${y}px`;
      this.updateFieldPosition();
    }
  };

  setPositionFromField = () => {
    if (this.field) {
      const pageDiv = document.querySelector(
        `#d${this.field.documentId}p${this.field.pageNumber}`
      );
      if (pageDiv) {
        const pageBound = pageDiv.getBoundingClientRect();
        const pageHeight = pageDiv.getAttribute('page-height');
        const pageWidth = pageDiv.getAttribute('page-width');
        if (pageHeight && pageWidth) {
          this.divField.nativeElement.style.left = `${this.field.xPosition / (parseInt(pageWidth, 10) / pageBound.width)
            }px`;
          this.divField.nativeElement.style.top = `${this.field.yPosition / (parseInt(pageHeight, 10) / pageBound.height)
            }px`;
        }
      }
    }
  };

  remove() {
    this.display = 'None';
    if (this.field) {
      this.field.isDeleted = true;
    }
  }

}