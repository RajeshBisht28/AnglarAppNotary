import { Component, ComponentRef, ElementRef, EmbeddedViewRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, tap } from 'rxjs';
import { Package, StandardField } from 'src/app/models/package.model';
import { FieldInfo, Signer } from 'src/app/models/signer.model';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { NotificationService } from 'src/app/core';
import { SHARED_IMPORTS } from 'src/app/shared';
import { SignatureComponent } from '../tag-control/signature/signature.component';
import { DateComponent } from '../tag-control/date/date.component';
import { TextComponent } from '../tag-control/text/text.component';
import { BaseTagComponent } from '../abstract-base-tag';
import { getFormattedValue, isEmptyValue } from 'src/app/models/utils';
import { CaptureSignService } from '../capture-sign.service';
import { NotaryStampComponent } from '../tag-control/notary-stamp/notary-stamp.component';

@Component({
  selector: 'notary-capture-live-sign',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS],
  templateUrl: './capture-live-sign.component.html',
  styleUrls: ['./capture-live-sign.component.scss']
})
export class CaptureLiveSignComponent implements OnInit, OnDestroy {

  public fields$?: Observable<StandardField[]>;
  public package$?: Observable<Package>;
  private package?: Package;
  public selectedSigner!: Signer;
  private imageLoadedCount: number = 0;
  private totalAvailablePages: number = 0;
  private components?: BaseTagComponent[];
  docFinishSubscription!: Subscription;
  docSyncEventSubscription!: Subscription;

  @ViewChild('parent', { read: ViewContainerRef }) target!: ViewContainerRef;

  @ViewChild('mainParent', { static: false }) mainElement!: ElementRef;

  @Input()
  packageId!: string;

  @Input()
  signerId!: any;

  constructor(
    private packageServiceApi: PackageApiService,
    private notificationService: NotificationService,
    private captureSignService: CaptureSignService
  ) {
    this.components = [];
  }

  ngOnInit(): void {
    if (this.packageId) {
      this.loadEnvelope(this.packageId);
    }
    this.docFinishSubscription = this.captureSignService.finishDocEvent.subscribe(() => {
      this.finish();
    })

    this.docFinishSubscription = this.captureSignService.docSyncEvent.subscribe(() => {
      this.loadEnvelope(this.packageId);
    })
  }

  ngOnDestroy(): void {
    if (this.docFinishSubscription) {
      this.docFinishSubscription.unsubscribe();
    }
    if (this.docSyncEventSubscription) {
      this.docSyncEventSubscription.unsubscribe();
    }
  }

  loadEnvelope(packageId: string) {
    this.package$ = this.packageServiceApi
      .getPackage(packageId)
      .pipe(
        tap((pkg: Package) => {
          this.package = pkg;
          const signer = pkg.signers.find(
              (s) => s.recipientId == this.signerId
            );
            if (signer && signer!) {
              this.selectedSigner = signer;
            }
            pkg.documents.forEach((doc) => {
            this.totalAvailablePages += doc.pages.length;
          });
        }),
      );
  }

  imageLoad = () => {
    this.imageLoadedCount += 1;
    if (this.imageLoadedCount === this.totalAvailablePages) {
      if (this.selectedSigner && this.selectedSigner.status !== 'Signed') {
        this.loadgSignerFields(this.selectedSigner);
      }
    }
  };

  loadgSignerFields = (signer: Signer) => {
    const { fields } = signer;
    this.loadFields(fields, signer);
  };


  loadFields = (fields: FieldInfo[], signer: Signer) => {
    if (!fields || fields.length === 0) {
      return;
    }

    fields.forEach((field) => {
      const componentRef = this.getComponentRef(field.type);
      if (componentRef !== undefined) {
        const { instance } = componentRef;
        this.components?.push(instance);

        field.name = field.standardTagName!
        field.signerName = signer.name;

        instance.field = field;

        instance.packageId = this.packageId;

        const { nativeElement } = componentRef.location;
        nativeElement.style.position = 'absolute';

        const fieldDiv = this.mainElement.nativeElement.querySelector(
          `#d${field.documentId}p${field.pageNumber}`
        );
        const viewRef1 = componentRef.hostView as EmbeddedViewRef<any>;
        fieldDiv.appendChild(viewRef1.rootNodes[0]);

        const pageBound = fieldDiv.getBoundingClientRect();
        const pageHeight = fieldDiv.getAttribute('page-height');
        const pageWidth = fieldDiv.getAttribute('page-width');
        const left = field.xPosition / (parseInt(pageWidth, 10) / pageBound.width);
        const top = field.yPosition / (parseInt(pageHeight, 10) / pageBound.height);

        // Apply directly to DOM
        nativeElement.style.left = `${left}px`;
        nativeElement.style.top = `${top}px`;

        // Optional: if your BaseTagComponent expects them too
        instance.left = `${left}px`;
        instance.top = `${top}px`;
      }
    });
  }

  getComponentRef(key: string): ComponentRef<any> | undefined {

    const componentMap: Record<string, any> = {
      Signature: SignatureComponent,
      Date: DateComponent,
      Initial: SignatureComponent,
      Text: TextComponent,
      Company: TextComponent,
      Seal: NotaryStampComponent
    };

    const component = componentMap[key] || TextComponent;
    return this.target.createComponent(component);
  }

  finish = () => {

    if (!this.selectedSigner || !this.packageId) {
      return;
    }

    const missingComponent = this.components?.find((p) =>
      p.field.isRequired === 'Y' && isEmptyValue(p.field.value)
    );

    if (missingComponent) {
      this.notificationService.showError("Please fill all the values")
      missingComponent.focus();
      return;
    }

    this.components?.forEach((p) => {
      p.field.value = getFormattedValue(p.field.value);
    });
 
    this.packageServiceApi.signerSignedDocument(this.packageId, this.selectedSigner)
      .subscribe(() => { 
        this.captureSignService.finishApiResponseEvent.emit();
      })
  };
}
