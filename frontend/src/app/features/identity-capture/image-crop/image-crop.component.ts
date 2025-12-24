import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ImageCropperComponent, ImageCropperModule, ImageTransform } from 'ngx-image-cropper';
import { MatButtonModule } from '@angular/material/button';
import {MatSliderModule} from '@angular/material/slider';

import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-image-crop',
  standalone: true,
  imports: [CommonModule, 
    ImageCropperModule,
    MatDialogModule,
    MatButtonModule,
    MatSliderModule,
    FormsModule
  ],
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss']
})
export class ImageCropComponent implements OnInit {

  @ViewChild(ImageCropperComponent) cropper!: ImageCropperComponent;

  imgWidth = 0;
  imgHeight = 0;

  constructor(
    public dialogRef: MatDialogRef<ImageCropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  onImageLoaded(event: any) {
    // Full resolution exact image size
    this.imgWidth = event.original?.width || 0;
    this.imgHeight = event.original?.height || 0;
  }

  onClose() {
    this.dialogRef.close();
  }

  async onAccept() {
    const cropEvent = await this.cropper.crop();

    if (!cropEvent?.blob) {
      this.dialogRef.close(null);
      return;
    }

    const base64 = await this.blobToBase64(cropEvent.blob);
    this.dialogRef.close(base64);
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}