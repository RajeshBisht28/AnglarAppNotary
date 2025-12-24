import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotarizationApiService, NotaryRegistrationService, NotificationService } from 'src/app/core';
import { DigitalSeal } from 'src/app/models/notary-registration.model';
import { NotaryRegistrationStoreService } from '../service/notary-registration-store.service';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent],
  selector: 'notary-digital-seal',
  templateUrl: './digital-seal.component.html',
  styleUrls: ['./digital-seal.component.scss'],
  providers: [DatePipe]
})
export class DigitalSealComponent {
  @Input() sealData: any;
  @Output() complete = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  sealForm: FormGroup;
  sealPreview: string | ArrayBuffer | null = null;
  sealGenerated: boolean = false;
  notaryId: string | null;
  sealImageSrc: string | null = null; 

  constructor(private fb: FormBuilder,
    private apiService: NotarizationApiService,
    private notaryRegistrationService: NotaryRegistrationService,
    private notificationService: NotificationService,
    private registrationStore: NotaryRegistrationStoreService,
    private datePipe: DatePipe
  ) {
    this.notaryId = this.registrationStore.getNotaryId();
    this.sealForm = this.fb.group({
      sealName: ['', [Validators.required]],
      sealStyle: ['', [Validators.required]],
      sealUpperText: ['', [Validators.required]],
      sealLowerText: ['', [Validators.required]],
      notaryId: ['', [Validators.required]],
      sealExpiryDate: ['', [Validators.required]],
      //signature: [null, [Validators.required]]
    });
  }

  // onSignatureUpload(event: any) {
  //   const file = event.target.files[0];
  //   this.sealForm.get('signature')?.setValue(file);

  //   const reader = new FileReader();
  //   reader.onload = () => this.sealPreview = reader.result;
  //   reader.readAsDataURL(file);
  // }

  // generatePreview() {
  //   this.sealPreview = `assets/seal-${this.sealForm.value.sealStyle}.png`;
  // }

  // generateSeal() {
  //   this.apiService.sealCreate(this.sealForm.value.sealStyle, this.sealForm.value)
  //   .subscribe(data=>{})
  // }

  generateSeal() {
      if (this.sealForm.invalid) {
    this.notificationService.showError('Please fill all required fields before generating the seal.');
    return;
  }

  this.apiService.sealCreate(this.sealForm.value.sealStyle, this.sealForm.value)
    .subscribe({
      next: (data: any) => {
        if (data.status === "True" && data.outpath) {
          this.sealPreview = data.outpath;

          this.sealImageSrc = data.outpath.startsWith('data:image')
            ? data.outpath
            : `data:image/png;base64,${data.outpath}`;

          this.sealGenerated = true;
        } else {
          this.notificationService.showError('Failed to generate seal.');
        }
      },
    });
  }

onNext() {
  if (this.sealForm.valid && this.sealGenerated) {
    // format date here
    const formattedDate = this.datePipe.transform(
      this.sealForm.value.sealExpiryDate,
      'yyyy-MM-dd HH:mm:ss'
    );

    const data: DigitalSeal = {
      ...this.sealForm.value,
      sealExpiryDate: formattedDate, 
      sealBase64Content: this.sealPreview,
      id: this.notaryId
    };

    this.notaryRegistrationService.uploadDigitalSeal(data).subscribe({
      next: res => {
        this.complete.emit({
          ...this.sealForm.value,
          sealExpiryDate: formattedDate,
          preview: this.sealPreview
        });
      },
    });
  }
}

}
