import { Component, OnDestroy, OnInit, signal, computed, effect } from '@angular/core';
import { AuditCaptureService, LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogService } from 'src/app/shared/components/dynamic-dialog/dynamic-dialog.service';
import { NotarizationApiService } from 'src/app/core/services/business/notarization-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StepService } from '../service/step.service';
import { of, Subscription } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { AuthService } from 'src/app/core';
import { environment } from 'src/environments/environment';
import { ExtractedDataDisplayComponent } from './extracted-data-display.component';
import { AuditCapture } from 'src/app/models/audit-capture.enum';

type DeviceChoice = 'mobile' | 'web';
type Stage = 'device' | 'idType' | 'qr' | 'extracted' | 'submitted';

@Component({
  standalone: true,
  selector: 'id-verification',
  imports: [...SHARED_IMPORTS, LoadingComponent, ExtractedDataDisplayComponent],
  templateUrl: './id-verification.component.html',
  styleUrls: ['./id-verification.component.scss']
})
export class IdVerificationComponent implements OnInit, OnDestroy {
  stage: Stage = 'device';
  selectedDevice: DeviceChoice = 'mobile';
  packageId!: string | null | undefined;
  qrBase64: string | null = null;
  loadingQr = false;
  private sub = new Subscription();
  userDetail: any;
  signerId: any;

  qrReady = signal(false);
  verificationStatus = signal<string | null>(null);
  extractedData = signal<string | null>(null);
  submitted = computed(() => this.verificationStatus() === 'Y');
  polling = signal(false);
  private pollTimer: any = null;

  countries = [
    { code: 'US', name: 'United States' }
    // ,
    // { code: 'CA', name: 'Canada' },
    // { code: 'GB', name: 'United Kingdom' },
    // { code: 'AU', name: 'Australia' },
    // { code: 'IN', name: 'India' },
    // { code: 'DE', name: 'Germany' },
    // { code: 'FR', name: 'France' },
    // { code: 'ES', name: 'Spain' },
    // { code: 'IT', name: 'Italy' },
    // { code: 'MX', name: 'Mexico' }
  ];

  idTypes = [
    { value: 'drivers_license', label: "Driver's license or learner’s permit" },
    { value: 'passport', label: 'Passport' },
    { value: 'state_id', label: 'State ID card' },
    { value: 'passport_card', label: 'Passport card' },
    { value: 'work_permit', label: 'Work permit' },
    { value: 'permanent_resident', label: 'Permanent resident card' }
  ];

  idForm = this.fb.group({
    country: ['US', Validators.required],
    idType: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private dialog: DynamicDialogService,
    private api: NotarizationApiService,
    private route: ActivatedRoute,
    private stepService: StepService,
    private packageServiceApi: PackageApiService,
    private authUser: AuthService,
    private router: Router,
    private auditCaptureService: AuditCaptureService,
    private saveForLaterService: StepService
  ) {
    this.initPollingEffect();

    effect(() => {
      const shouldSave = this.saveForLaterService.saveForLaterSignal();
      if (shouldSave) {
        this.saveForLater();
      }
    })
  }

  ngOnInit(): void {
    this.userDetail = this.authUser.getUser()
    this.packageId = this.route.parent?.snapshot.paramMap.get('id');
    this.signerId = this.route.snapshot.paramMap.get('signerId')
    // const saved = this.stepService.getStepData(this.packageId, 'idVerification');
    // if (saved?.selectedDevice) this.selectedDevice = saved.selectedDevice as DeviceChoice;
    // if (saved?.country && saved?.idType) {
    //   this.idForm.patchValue({ country: saved.country, idType: saved.idType });
    // }
    // if (saved?.qrBase64) {
    //   this.qrBase64 = saved.qrBase64;
    //   this.stage = 'qr';
    // }

    this.sub.add(this.stepService.next$.subscribe(() => this.onNext()));
    this.sub.add(this.stepService.prev$.subscribe(() => this.onPrevious()));
  }

  ngOnDestroy(): void {
    this.qrReady.set(false);
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.sub.unsubscribe();
  }

  chooseDevice(choice: DeviceChoice): void {
    this.selectedDevice = choice;
  }

  continueFromDevice(): void {
    this.stage = 'idType';
  }

  backFromIdType(): void {
    this.stage = 'device';
  }

  continueFromIdType(): void {
    if (this.idForm.invalid) {
      this.idForm.markAllAsTouched();
      return;
    }

    this.dialog.open({
      title: 'Consent to ID verification',
      message:
        'By continuing, you consent to the collection, use, and processing of your government-issued identification for the purpose of identity verification. Your information will be encrypted, securely stored, and used solely to provide verification services in accordance with applicable laws and privacy safeguards.',
      fields: [
        {
          name: 'consent',
          label: 'I have read and agree to the privacy notice and consent to verification.',
          type: 'checkbox',
          required: true
        }
      ],
      buttons: [
        { text: 'Decline', type: 'close' },
        { text: 'Accept & Continue', type: 'custom', color: 'primary', actionKey: 'accept', disabledWhenInvalid: true }
      ],
      autoCloseOnSuccess: true,
      onAction: (actionKey: string) => {
        if (actionKey !== 'accept') return;
        this.auditCaptureService.captureEvent({
          packageId: this.packageId!,
          event: AuditCapture.Id_DOCUMENT_CAPTURE_CONSENT_ACCEPTED
        })
        if (this.selectedDevice === 'web') {
          return this.startVerificationWithWeb()
        } else {
          return this.startVerification$();
        }
      }
    }).subscribe();
  }

  private startVerification$() {

    this.loadingQr = true;
    return this.packageServiceApi.getQRCode(this.packageId!, this.userDetail.userId, this.idForm.value.idType!, this.idForm.value.country!).pipe(
      tap((res: any) => {
        this.qrBase64 = res.blob;
        this.stage = 'qr';
        this.persist();
        if (this.qrBase64) {
          this.stepService.markStepCompleted(this.packageId!, 'idVerification');
          this.qrReady.set(true);
        }
      }),
      finalize(() => {
        this.loadingQr = false;
      })
    );
  }

  startVerificationWithWeb() {
    const url = `${environment.API_URL}/e-notary/eNotary/packages/${this.packageId}/users/${this.userDetail.userId}/type/${this.idForm.value.idType!}/region/${this.idForm.value.country!}`;
    window.open(url, '_blank', 'width=600,height=800');
    this.qrReady.set(true);
    return of(true);
  }

  backFromQr(): void {
    this.stage = 'idType';
    this.qrReady.set(false);
  }

  private persist(): void {
    this.stepService.saveStepData(this.packageId!, 'idVerification', {
      selectedDevice: this.selectedDevice,
      country: this.idForm.value.country,
      idType: this.idForm.value.idType,
      qrBase64: this.qrBase64
    });
  }

  private initPollingEffect(): void {
    effect(onCleanup => {
      if (!this.qrReady()) {
        return;
      }
      if (!this.packageId) {
        return;
      }
      this.polling.set(true);
      const check = () => {
        this.packageServiceApi.getVerificationStatus(this.packageId as string).subscribe({
          next: (res: any) => {
            this.verificationStatus.set(res?.isIdDocumentVerified ?? null);
            if (res?.extractedData) {
              this.stage = "extracted"
              this.extractedData.set(res.extractedData);
            }
            if (this.verificationStatus() === 'Y') {
              this.stage = 'submitted'
              if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
              }
              this.polling.set(false);
            }
          },
          error: () => { }
        });
      };
      check();
      this.pollTimer = setInterval(check, 5000);
      onCleanup(() => {
        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = null;
        }
        this.polling.set(false);
      });
    }, { allowSignalWrites: true });
  }

  onPrevious(): void {
    if (this.packageId) {
      this.router.navigate(['/document/package', this.packageId, 'sign']);
    }
  }

  onNext(): void {
    this.router.navigate(['/document/package', this.packageId, 'session', 'applicant', this.signerId]);
  }

  saveForLater() {
    if (this.userDetail?.userType === 'User') {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['/notary-user/dashboard']);
    }
  }
}
