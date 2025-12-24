import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Inject, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SHARED_IMPORTS } from 'src/app/shared';
import { IdentityVerificationService } from 'src/app/core/services/business/identity-verification.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { ImageCropComponent } from './image-crop/image-crop.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'identity-capture',
  imports: [...SHARED_IMPORTS],
  templateUrl: './identity-capture.component.html',
  styleUrls: ['./identity-capture.component.scss']
})
export class IdentityCaptureComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('faceVideoEl') faceVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('faceCanvasEl') faceCanvasRef!: ElementRef<HTMLCanvasElement>;

  userId = '';
  docType = '';
  region = '';
  packageId = '';

  stage: 'selection' | 'intro' | 'camera' | 'review' | 'uploading' | 'done' | 'face-intro' | 'face-camera' | 'face-review' | 'face-uploading' | 'final-success' = 'selection';
  isValidating = false;
  stream: MediaStream | null = null;

  currentSide: 'front' | 'back' = 'front';
  frontBase64: string | null = null;
  backBase64: string | null = null;
  faceBase64: string | null = null;
  private retakeMode: 'none' | 'front' | 'back' = 'none';

  sanitizeImagePreview: any;

  regions = [
    { code: 'US', name: 'United States' }
  ];

  idTypes = [
    { value: 'drivers_license', label: "Driver's license or learner's permit" },
    { value: 'passport', label: 'Passport' },
    { value: 'state_id', label: 'State ID card' },
    { value: 'passport_card', label: 'Passport card' },
    { value: 'work_permit', label: 'Work permit' },
    { value: 'permanent_resident', label: 'Permanent resident card' }
  ];

  constructor(
    private route: ActivatedRoute,
    private verification: IdentityVerificationService,
    private notifier: NotificationService,
    private packages: PackageApiService,
    private dialog: MatDialog,
    @Optional() public dialogRef?: MatDialogRef<IdentityCaptureComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData?: { packageId: string; userId: string; docType?: string; region?: string }
  ) { }

  ngOnInit(): void {
    // If opened via dialog, use dialog data, otherwise use route parameters
    if (this.dialogData) {
      this.userId = this.dialogData.userId || '';
      this.packageId = (this.dialogData.packageId || '').toUpperCase();

      // Check if region and docType are provided
      if (this.dialogData.region && this.dialogData.docType) {
        this.docType = this.dialogData.docType.toLowerCase();
        this.region = this.dialogData.region.toUpperCase();
        this.stage = 'intro';
      } else {
        // No region/docType provided, start with selection stage
        this.stage = 'selection';
      }
    } else {
      // Route-based initialization
      this.userId = this.route.snapshot.paramMap.get('userId') || '';
      this.docType = (this.route.snapshot.paramMap.get('docType') || '').toLowerCase();
      this.region = (this.route.snapshot.paramMap.get('region') || '').toUpperCase();
      this.packageId = (this.route.snapshot.paramMap.get('packageId') || '').toUpperCase();

      // If route provides docType and region, move to intro stage
      if (this.docType && this.region) {
        this.stage = 'intro';
      }
    }
  }

  onIdTypeSelected(region: string, idType: string): void {
    this.region = region.toUpperCase();
    this.docType = idType.toLowerCase();
    this.stage = 'intro';
  }

  get docTitle(): string {
    const map: Record<string, string> = {
      passport: 'Passport',
      license: 'Driver License',
      'driver-license': 'Driver License',
      'drivers_license': 'Driver License',
       dl: 'Driver License',
       id: 'ID',
      'id-card': 'ID Card',
      stateid: 'State ID',
      'state-id': 'State ID',
      'permanent_resident': 'Permanent Resident',
      'work_permit': 'Work Permit',
      'state_id': 'State ID',
      'passport_card': 'Passport'
    };
    return map[this.docType] || (this.docType ? this.docType : 'document');
  }

  get docTypeLabel(): 'Passport' | 'DL' | 'StateID' | string {
    if (['license', 'driver-license', 'dl'].includes(this.docType)) return 'DL';
    if (['stateid', 'state-id', 'id', 'id-card'].includes(this.docType)) return 'StateID';
    if (['passport'].includes(this.docType)) return 'Passport';
    return this.docType;
  }

  get sideTitle(): string {
    return this.currentSide === 'front' ? 'Front' : 'Back';
  }

  async openCamera(): Promise<void> {
    this.stage = 'camera';
    this.currentSide = 'front';
    this.frontBase64 = null;
    this.backBase64 = null;
    await this.startStream();
  }

  private async startStream(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      } as any;
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
    } catch (err: any) {
      this.notifier.showError('Camera access denied or unavailable.');
      this.stage = 'intro';
    }
  }

  async captureCurrent(): Promise<void> {
    if (!this.videoRef) return;

    try {
      const video = this.videoRef.nativeElement;
      const canvas = this.canvasRef.nativeElement;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not supported.');
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = (dataUrl.split(',')[1] || dataUrl).trim();

      this.onImageChange(base64)
    } catch (e) {
      this.notifier.showError('Capture failed. Please try again.');
      this.stage = 'intro';
      this.stopStream();
    }
  }

  async retake(side: 'front' | 'back'): Promise<void> {
    this.currentSide = side;
    this.retakeMode = side;
    this.stage = 'camera';
    await this.startStream();
  }

  uploadBoth(): void {
    if (!this.frontBase64 || !this.backBase64) {
      this.notifier.showError('Both front and back images are required.');
      return;
    }

    const frontName = `${this.docTypeLabel}-Front.jpeg`;
    const backName = `${this.docTypeLabel}-Back.jpeg`;

    const frontBody = {
      id: 0,
      documentBase64Content: this.frontBase64,
      documentName: frontName,
      documentType: this.docTypeLabel,
      documentSide: 'Front' as const
    };

    const backBody = {
      id: 0,
      documentBase64Content: this.backBase64,
      documentName: backName,
      documentType: this.docTypeLabel,
      documentSide: 'Back' as const
    };

    this.stage = 'uploading';

    this.packages.uploadIdDocument(this.packageId, frontBody).subscribe({
      next: (frontRes: any) => {
        if (frontRes?.status !== true) {
          this.notifier.showError('Front side upload failed. Please review and try again.');
          this.stage = 'review';
          return;
        }

        this.packages.uploadIdDocument(this.packageId, backBody).subscribe({
          next: (backRes: any) => {
            if (backRes?.status === true) {
              this.notifier.showSuccess('ID uploaded successfully');
              this.stage = 'face-intro';
            } else {
              this.notifier.showError('Back side upload failed. Please review and try again.');
              this.stage = 'review';
            }
          },
          error: () => {
            this.notifier.showError('Back side upload failed. Please try again.');
            this.stage = 'review';
          }
        });
      },
      error: () => {
        this.notifier.showError('Front side upload failed. Please try again.');
        this.stage = 'review';
      }
    });
  }


  stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  get frontPreviewUrl(): string | null {
    return this.frontBase64 ? `data:image/jpeg;base64,${this.frontBase64}` : null;
  }

  get backPreviewUrl(): string | null {
    return this.backBase64 ? `data:image/jpeg;base64,${this.backBase64}` : null;
  }

  get facePreviewUrl(): string | null {
    return this.faceBase64 ? `data:image/jpeg;base64,${this.faceBase64}` : null;
  }

  async openFaceCamera(): Promise<void> {
    this.stage = 'face-camera';
    this.faceBase64 = null;
    await this.startFaceStream();
  }

  private async startFaceStream(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      } as any;
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.faceVideoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
    } catch (err: any) {
      this.notifier.showError('Camera access denied or unavailable.');
      this.stage = 'face-intro';
    }
  }

  async captureFace(): Promise<void> {
    if (!this.faceVideoRef) return;
    this.isValidating = true;
    try {
      const video = this.faceVideoRef.nativeElement;
      const canvas = this.faceCanvasRef.nativeElement;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not supported.');
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = (dataUrl.split(',')[1] || dataUrl).trim();

      this.faceBase64 = base64;
      this.stopStream();
      this.stage = 'face-review';
      this.isValidating = false;
      this.onImageChange(base64)

    } catch (e) {
      this.isValidating = false;
      this.notifier.showError('Capture failed. Please try again.');
      this.stage = 'face-intro';
      this.stopStream();
    }
  }

  async retakeFace(): Promise<void> {
    this.faceBase64 = null;
    this.stage = 'face-camera';
    await this.startFaceStream();
  }

  uploadFace(): void {
    if (!this.faceBase64) {
      this.notifier.showError('Face image is required.');
      return;
    }

    this.stage = 'face-uploading';

    this.packages.uploadFaceCapture(this.packageId, this.faceBase64).subscribe({
      next: (res: any) => {
        if (res?.status === true) {
          this.notifier.showSuccess('Face captured successfully');
          this.stage = 'final-success';
          this.completeIdentityCapture();
        } else {
          this.notifier.showError('⚠️ Face does not match with the document photo. Please try again.');
          this.stage = 'face-review';
        }
      },
      error: () => {
        this.notifier.showError('Face upload failed. Please try again.');
        this.stage = 'face-review';
      }
    });
  }

  private completeIdentityCapture(): void {
    if (this.dialogRef) {
      setTimeout(() => {
        this.dialogRef!.close({ success: true });
      }, 1500);
    }
  }

  onImageChange(base64: string) {
    if (!base64) return;

    this.dialog
      .open(ImageCropComponent, {
        data: base64
      })
      .afterClosed()
      .subscribe((croppedBase64: string | null) => {
        if (!croppedBase64) return;
        const base64Image = (croppedBase64.split(',')[1] || croppedBase64).trim();
        if (this.stage !== 'face-review') {
          this.processCroppedImage(base64Image);
        }
      });
  }

  processCroppedImage(base64: string) {
    this.isValidating = true;
    this.verification.preprocessIdImage(base64).subscribe({
      next: (res: any) => {
        if (res?.status === true) {

          // ------- RETAKE MODE -------
          if (this.retakeMode !== 'none') {
            if (this.retakeMode === 'front') this.frontBase64 = base64;
            if (this.retakeMode === 'back') this.backBase64 = base64;

            this.retakeMode = 'none';
            this.stopStream();
            this.stage = 'review';

            // ------- NORMAL FLOW -------
          } else if (this.currentSide === 'front') {
            this.frontBase64 = res.image_blob;
            this.currentSide = 'back';

          } else {
            this.backBase64 = res.image_blob;
            this.stopStream();
            this.stage = 'review';
          }

        } else {
          // ------- ERROR UI -------
          if (this.currentSide === 'front') {
            this.notifier.showError('Front image validation failed. Please retake.');
          } else {
            this.notifier.showError('Back image validation failed. Please retake.');
          }
        }

        this.isValidating = false;
      },

      error: () => {
        this.isValidating = false;
        this.notifier.showError('Validation failed. Please try again.');
      }
    });
  }

  ngOnDestroy(): void {
    this.stopStream();
  }
}
