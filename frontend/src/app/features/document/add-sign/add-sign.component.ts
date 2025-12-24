import { Component, effect, ElementRef, EmbeddedViewRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { Observable, tap } from 'rxjs';
import { Package, Page, StandardField, Document } from 'src/app/models/package.model';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { StepService } from '../service/step.service';
import { Subscription } from 'rxjs';
import { FieldInfo, Signer, } from 'src/app/models/signer.model';
import { UUID } from 'angular2-uuid';
import { DocumentThumbnailsComponent } from '../thumbnails/document-thumbnails.component';
import { FieldComponent } from './field/field.component';
import { NotificationService, AuthService } from 'src/app/core';
import { SignerRole } from 'src/app/models/signerRole.enum';
import { User } from 'src/app/models/auth.models';

@Component({
  selector: 'notary-add-sign',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, LoadingComponent, DocumentThumbnailsComponent],
  templateUrl: './add-sign.component.html',
  styleUrls: ['./add-sign.component.scss']
})
export class AddSignComponent implements OnInit, OnDestroy {

  packageId!: string | null | undefined;
  public fields$?: Observable<StandardField[]>;
  public package$?: Observable<Package>;
  private package?: Package;
  public selectedSigner!: Signer;
  private imageLoadedCount: number = 0;

  private totalAvailablePages: number = 0;
  private readonly JSON_KEY = '[JSON]';
  private userFields: FieldComponent[] = [];
  private applicantSignerId: any;

  @ViewChild('documentContainer', { read: ViewContainerRef })
  target!: ViewContainerRef;

  @ViewChild('documentContainer', { static: false })
  documentContainerEl!: ElementRef<HTMLElement>;

  @ViewChild('parent', { static: false }) mainElement!: ElementRef;

  private sub: Subscription = new Subscription();

  userDetail: User | undefined

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packageServiceApi: PackageApiService,
    private stepService: StepService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private saveForLaterService: StepService
  ) { 
    this.userDetail = authService.getUser();
    effect(() => {
      const shouldSave = this.saveForLaterService.saveForLaterSignal();
      if (shouldSave) {
        this.saveForLater();
      }
    })
  }

  ngOnInit(): void {
    this.setFields();
    this.packageId = this.route.parent?.snapshot.paramMap.get('id');
    if (this.packageId) {
      this.loadEnvelope(this.packageId);
    }
    this.sub.add(this.stepService.prev$.subscribe(() => this.onPrevious()));
    this.sub.add(this.stepService.next$.subscribe(() => this.onNext()));
  }

  loadEnvelope(packageId: string) {
    this.package$ = this.packageServiceApi
      .getPackage(packageId)
      .pipe(
        tap((pkg: Package) => {
          this.package = pkg;
          [this.selectedSigner] = pkg.signers;
          pkg.documents.forEach((doc) => {
            this.totalAvailablePages += doc.pages.length;
          });
          const signer = pkg.signers.find(
              (s) => s.role === SignerRole.APPLICANT
            );

            if (signer && signer!) {
              this.applicantSignerId = signer.recipientId;
            }
        }),
      );
  }

  private setFields = () => {
    this.fields$ = this.packageServiceApi
      .getSignFields()
  };

  imageLoad = () => {
    this.imageLoadedCount += 1;
    if (this.imageLoadedCount === this.totalAvailablePages) {
      if (this.package) this.loadExistingSignersFields(this.package.signers);
    }
  };

  loadExistingSignersFields = (signers: Signer[]) => {
    signers.forEach((signer) => this.loadExistingSignerFields(signer));
  };

  loadExistingSignerFields = (signer: Signer) => {
    const { fields } = signer;
    this.loadFields(fields, signer);
  };


  loadFields = (fields: FieldInfo[], signer: Signer) => {
    if (!fields || fields.length === 0) {
      return;
    }
    if (this.target !== undefined) {
      fields.forEach((field: FieldInfo) => {
        const fieldDiv = document.querySelector(
          `#d${field.documentId}p${field.pageNumber}`
        );

        field.UUID = UUID.UUID();
        field.signerName = signer.name;

        this.addField(this.target, field, fieldDiv, signer);
      });
    }
  };

  addField(
    viewRef: ViewContainerRef,
    field: FieldInfo,
    e: any,
    signer: Signer
  ) {
    const componentRef = viewRef.createComponent(FieldComponent);

    const { instance } = componentRef;
    instance.field = field;
    this.userFields.push(instance);

    const { nativeElement } = componentRef.location;
    nativeElement.style.position = 'absolute';

    if (field.tabId) {
      const viewRef1 = componentRef.hostView as EmbeddedViewRef<any>;
      e.appendChild(viewRef1.rootNodes[0]);
    } else {
      instance.droppedElement = e;
      nativeElement.id = field.UUID;

      const viewRef1 = componentRef.hostView as EmbeddedViewRef<any>;
      if (e && e.target && typeof e.target.appendChild === 'function') {
        e.target.appendChild(viewRef1.rootNodes[0]);
        this.updateSignerField(field, signer);
      } else {
        componentRef.destroy();
      }
    }
  }

  updateSignerField = (field: FieldInfo, signer: Signer) => {
    signer.fields.push(field);
  };

  itemDropped = (e: any, document: Document, page: Page, signer: Signer) => {
    const data: string = e.dataTransfer.getData('text/plain');
    if (data.startsWith(this.JSON_KEY)) {
      const field = JSON.parse(
        data.replace(this.JSON_KEY, '')
      ) as StandardField;
      if (this.target) {
        const fieldInfo: FieldInfo = {
          UUID: UUID.UUID(),
          documentId: document.documentId,
          name: field.name,
          signerName: signer.name,
          pageNumber: page.pageNumber,
          tabLabel: field.name,
          xPosition: 0,
          yPosition: 0,
          recipientId: signer.recipientId,
          type: field.type!,
          standardTagId: field.id,
          standardTagName: field.name,
          standardTag: field.standardTag,
          highlight: false,
        };
        this.addField(this.target, fieldInfo, e, signer);
      }
    }
  };

  dragEnter = (e: any) => {
    e.preventDefault();
  };

  dragover = (e: any) => {
    e.preventDefault();
  };

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onPrevious(): void {
    if (this.packageId) {
      this.router.navigate(['/document/package', this.packageId, 'participants']);
    }
  }

  onNext(): void {
    if (this.packageId && this.package?.signers) {
      this.removeDeletedItem(this.package?.signers);
      const signers = this.package?.signers;
      if (signers?.some(signer => signer.fields?.length > 0)) {
        this.packageServiceApi.savePackage(this.packageId, signers)
          .subscribe((res) => {
            if (res.status === "0") {
              const user = this.authService.getUser();
              const isNotaryUser = user?.userType === 'Notary' || user?.role === 'Notary';

              if (isNotaryUser) {
                this.router.navigate(['/document/package', this.packageId, 'session', 'applicant', this.applicantSignerId]);
              } else {
                this.router.navigate(['/document/package', this.packageId, 'id-verification', 'applicant', this.applicantSignerId]);
              }
            }
          })
      } else {
        this.notificationService.showError("Before proceeding to the next step, please drag and drop some fields")
      }
    }
  }

 scrollTo(evt: { documentId: number; pageNumber: number }) {
    const targetId = `d${evt.documentId}p${evt.pageNumber}`;
    const container = this.documentContainerEl?.nativeElement;
    const el = document.getElementById(targetId);
    if (container && el) {
      const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 8;
      container.scrollTo({ top, behavior: 'smooth' });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  addFieldDragStart = (e: any, field: StandardField) => {
    e.dataTransfer.setData(
      'text/plain',
      `${this.JSON_KEY}${JSON.stringify(field)}`
    );
  };

  removeDeletedItem(signers: Signer[]) {
    signers.forEach((signer) => this.deleteDeletedFields(signer));
  }

  deleteDeletedFields = (signer: Signer) => {
    const { fields } = signer;
      this.deleteFields(fields, signer);
  };

  deleteFields = (fields: FieldInfo[], signer: any) => {
    if (!fields || fields.length === 0) {
      return;
    }
    signer.fields = fields.filter(
      (p) => !p.isDeleted || p.isDeleted !== true
    );
  };

  saveForLater() {
    if (this.userDetail?.userType === 'User') {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['/notary-user/dashboard']);
    }

    if (this.packageId && this.package?.signers) {
      this.removeDeletedItem(this.package?.signers);
      const signers = this.package?.signers;
      // if (signers?.some(signer => signer.fields?.length > 0)) {
        this.packageServiceApi.savePackage(this.packageId, signers)
          .subscribe((res) => {
            if (res.status === "0") {
              const user = this.authService.getUser();
              const isNotaryUser = user?.userType === 'Notary' || user?.role === 'Notary';

              if (isNotaryUser) {
               this.router.navigate(['/notary-user/dashboard']);
              } else {
               this.router.navigate(['/user/dashboard']);
              }
            }
          })
      } else {
        this.notificationService.showError("Before proceeding to the next step, please drag and drop some fields")
      }
   // }
  }
}
