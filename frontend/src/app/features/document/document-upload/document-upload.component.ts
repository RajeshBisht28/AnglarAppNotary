import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { StepService } from '../service/step.service';
import { from, Observable, Subscription } from 'rxjs';
import { concatMap, finalize } from 'rxjs/operators';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AuthService } from 'src/app/core';
import { User } from 'src/app/models/auth.models';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent],
  selector: 'document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit, OnDestroy {
  packageId: string | null | undefined = null;
  isUploading = false;
  uploadedDocs: any[] = []
  private sub: Subscription = new Subscription();
  userDetail: User | undefined

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stepService: StepService,
    private packageService: PackageApiService,
    private notificationService: NotificationService,
    private authUser: AuthService,
    private saveForLaterService: StepService
  ) { 
    this.userDetail = authUser.getUser();

    effect(() => {
      const shouldSave = this.saveForLaterService.saveForLaterSignal();
      if (shouldSave) {
        this.saveForLater();
      }
    })
  }



  ngOnInit(): void {
    this.packageId = this.route.parent?.snapshot.paramMap.get('id');
    if (this.packageId) {
      this.loadExistingDocuments(this.packageId);
    }
    this.sub.add(this.stepService.next$.subscribe(() => this.onNext()));
    this.sub.add(this.stepService.prev$.subscribe(() => this.onPrevious()));
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.uploadFiles(files);
    event.target.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.uploadFiles(event.dataTransfer.files);
    }
  }


  private uploadFiles(files: FileList): void {
    if (!this.packageId) return;
    this.isUploading = true;

    from(Array.from(files))
      .pipe(
        concatMap(file => this.fileToBase64$(file).pipe(
          concatMap(({ name, base64 }) => {
            const body = {
              documentId: 0,
              documentName: name,
              documentBase64: base64,
              documentType: this.getFileExtension(name)
            };
            return this.packageService.uploadDocument(this.packageId!, body);
          })
        )),
        finalize(() => this.isUploading = false)
      )
      .subscribe({
        next: (res) => {
          this.uploadedDocs.push(res);
        },
      });
  }

  private loadExistingDocuments(packageId: string): void {
    this.isUploading = true;
    this.packageService.getAllDocument(packageId)
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: (docs) => {
          this.uploadedDocs = docs;
        }
      });
  }

  removeFile(index: number, doc: any): void {
    this.isUploading = true;
    this.packageService.deleteDocument(doc.documentId).subscribe({
      next: (res) => {
        if (res.status) {
        this.uploadedDocs.splice(index, 1);
        this.notificationService.showSuccess('Document deleted successfully');
        this.isUploading = false;
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.notificationService.showError('Failed to delete document');
      }
    });
  }

  onPrevious(): void {
    if (this.userDetail?.userType !== 'Notary') {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['notary-user/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onNext(): void {
    if (this.packageId && this.uploadedDocs && this.uploadedDocs.length > 0) {
       this.stepService.saveStepData(this.packageId, 'document', {document: "Name"});
       this.stepService.markStepCompleted(this.packageId, 'document');
      this.router.navigate(['/document/package', this.packageId, 'participants']);
    }
  }

  private fileToBase64$(file: File): Observable<{ name: string; base64: string }> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        observer.next({ name: file.name, base64 });
        observer.complete();
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsDataURL(file);
    });
  }

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }

  isFormValid(): boolean {
    return this.uploadedDocs.length > 0 && !this.isUploading;
  }

  saveForLater() {
    if (this.userDetail?.userType === 'User') {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['/notary-user/dashboard']);
    }
  }
}
