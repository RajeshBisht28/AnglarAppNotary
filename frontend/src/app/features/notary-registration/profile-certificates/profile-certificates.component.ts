import { Component, EventEmitter, Input, Output } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { NotificationService } from 'src/app/core';
import { NotaryRegistrationService } from 'src/app/core/services/business';
import { ProfileCertificate } from 'src/app/models/notary-registration.model';
import { NotaryRegistrationStoreService } from '../service/notary-registration-store.service';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
interface NotaryDocument {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  base64Content?: string;
}
@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent],
  selector: 'notary-profile-certificates',
  templateUrl: './profile-certificates.component.html',
  styleUrls: ['./profile-certificates.component.scss']
})
export class ProfileCertificatesComponent {

  notaryId!: string | null;

  constructor(
    private apiService: NotaryRegistrationService,
    private notificationService: NotificationService,
    private registrationStore: NotaryRegistrationStoreService
  ) {
    this.notaryId = this.registrationStore.getNotaryId();
  }

  @Input() profileData: any;
  @Output() complete = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  documents = {
    photoId: null as NotaryDocument | null,
    commissionCertificate: null as NotaryDocument | null,
    otherCertificates: [] as NotaryDocument[]
  };

  onFileSelected(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const document: NotaryDocument = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          base64Content: reader.result as string
        };
        if (type === 'other') {
          this.documents.otherCertificates.push(document);
        } else {
          this.documents[type as keyof Omit<typeof this.documents, 'otherCertificates'>] = document;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(index: number): void {
    this.documents.otherCertificates.splice(index, 1);
  }

  onNext(): void {
    const validationMessage = this.validateMandatoryDocuments();
    if (validationMessage) {
      return this.notificationService.showError(validationMessage);
    }

    const payloads: ProfileCertificate[] = [];
    payloads.push({
      id: this.notaryId!,
      field: 'PhotoId',
      name: this.documents?.photoId?.name!,
      base64Content: this.documents.photoId?.base64Content || ''
    });

    payloads.push({
      id: this.notaryId!,
      field: 'NotaryCommissionCertificate',
      name: this.documents.commissionCertificate?.name!,
      base64Content: this.documents.commissionCertificate?.base64Content || ''
    });

    this.documents.otherCertificates.forEach(doc => {
      payloads.push({
        id: this.notaryId!,
        field: 'AdditionalCertificate',
        name: doc.name,
        base64Content: doc.base64Content || ''
      });
    });

    const apiCalls = payloads.map(cert =>
      this.apiService.uploadProfileCertificate(cert).pipe(
        map(res => ({ res, cert })),
      )
    );

    forkJoin(apiCalls).subscribe({
      next: results => {
        const failedUploads = results.filter(r => !r.res.status);

        if (failedUploads.length > 0) {
          const failedFields = failedUploads.map(f => f.cert.field).join(', ');
          return this.notificationService.showError(`Failed to upload: ${failedFields}`)
        }
        this.complete.emit(this.documents);
      }
    });
  }

  private validateMandatoryDocuments(): string | null {
    // if (!this.profileData?.id) {
    //   return 'Notary ID is missing!';
    // }
    if (!this.documents.photoId) {
      return 'Please upload Photo ID';
    }
    if (!this.documents.commissionCertificate) {
      return 'Please upload Notary Commission Certificate';
    }
    return null;
  }
}