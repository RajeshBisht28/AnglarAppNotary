import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormArray
} from '@angular/forms';
import { forkJoin, from, map, of, switchMap } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { NotaryProfileResponse, SealResponse } from 'src/app/models/notary-profile.model';
import { LoadingComponent } from 'src/app/shared';

type DocPreviewMap = {
  commissionCertificate?: string;
  additionalCertificate?: string;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    LoadingComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private fb = inject(FormBuilder);
  private http = inject(NotaryUserAPIService);

  readonly avatarPreview = signal<string | null>(null);
  readonly docPreviews = signal<DocPreviewMap>({});

  readonly originalDocs = signal<{
    photoId?: string;
    commissionCertificate?: string;
    additionalCertificate?: string;
  }>({});

  readonly originalDocNames = signal<{
    photoIdName?: string;
    commissionCertificateName?: string;
    additionalCertificateName?: string;
  }>({});

  readonly form = this.fb.group({
    id: [''],

    alisName: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],

    company: [''],
    jobTitle: [''],

    address1: [''],
    address2: [''],
    city: [''],
    state: [''],
    zipcode: [''],

    phone: [''],
    fax: [''],
    altEmail: ['', Validators.email],

    commissionNumber: ['', Validators.required],
    commissionExpiryDate: [null as Date | null, Validators.required],
    jurisdiction: ['', Validators.required],

    calendlyPublicSessionUrl: [''],

    photoId: [null as File | null],
    commissionCertificate: [null as File | null],
    additionalCertificate: [null as File | null],

    seals: this.fb.array<FormGroup>([])
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  /* ================= GET ================= */

  private loadProfile(): void {
    this.http.getNotaryProfile().subscribe(res => {
      this.patchForm(res);
      this.setBase64Previews(res);
      this.patchSeals(res.seals || []);
    });
  }

  private patchForm(res: NotaryProfileResponse): void {
    this.form.patchValue({
      id: res.id,
      alisName: res.alisName,
      firstName: res.firstName,
      lastName: res.lastName,
      email: res.email,
      company: res.company,
      jobTitle: res.jobTitle,
      address1: res.address1,
      address2: res.address2,
      city: res.city,
      state: res.state,
      zipcode: res.zipcode,
      phone: res.phone,
      fax: res.fax,
      altEmail: res.altEmail,
      commissionNumber: res.commissionNumber,
      commissionExpiryDate: res.commissionExpiryDate
        ? new Date(res.commissionExpiryDate)
        : null,
      jurisdiction: res.jurisdiction,
      calendlyPublicSessionUrl: res.calendlyPublicSessionUrl
    });
  }

  private stripPrefix(v?: string): string | undefined {
    return v?.includes(',') ? v.split(',')[1] : v;
  }

  private setBase64Previews(res: any): void {

    this.originalDocs.set({
      photoId: this.stripPrefix(res.photoId),
      commissionCertificate: this.stripPrefix(res.notaryCommissionCertificate),
      additionalCertificate: this.stripPrefix(res.additionalCertificate)
    });

    this.originalDocNames.set({
      photoIdName: res.photoIdName,
      commissionCertificateName: res.notaryCommissionCertificateName,
      additionalCertificateName: res.additionalCertificateName
    });

    if (res.photoId) {
      this.avatarPreview.set(`data:image/png;base64,${this.stripPrefix(res.photoId)}`);
    }

    this.docPreviews.set({
      commissionCertificate: res.notaryCommissionCertificate
        ? `data:application/pdf;base64,${this.stripPrefix(res.notaryCommissionCertificate)}`
        : undefined,
      additionalCertificate: res.additionalCertificate
        ? `data:application/pdf;base64,${this.stripPrefix(res.additionalCertificate)}`
        : undefined
    });
  }

  /* ================= FILE ================= */

  onAvatarSelected(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.form.controls.photoId.setValue(f);
    this.previewFile(f, p => this.avatarPreview.set(p));
  }

  onDocSelected(e: Event, key: 'commissionCertificate' | 'additionalCertificate'): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.form.controls[key].setValue(f);
    this.previewFile(f, p => this.docPreviews.set({ ...this.docPreviews(), [key]: p }));
  }

  private previewFile(file: File, cb: (v: string) => void): void {
    const r = new FileReader();
    r.onload = () => cb(r.result as string);
    r.readAsDataURL(file);
  }

  private fileToBase64$(file: File | null) {
    if (!file) return of(null);
    return from(
      new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      })
    );
  }

  /* ================= SUBMIT ================= */

  submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    forkJoin({
      photoId: raw.photoId
        ? this.fileToBase64$(raw.photoId)
        : of(this.originalDocs().photoId ?? null),

      notaryCommissionCertificate: raw.commissionCertificate
        ? this.fileToBase64$(raw.commissionCertificate)
        : of(this.originalDocs().commissionCertificate ?? null),

      additionalCertificate: raw.additionalCertificate
        ? this.fileToBase64$(raw.additionalCertificate)
        : of(this.originalDocs().additionalCertificate ?? null)
    })
      .pipe(
        map(files => ({
          ...raw,
          ...files,
          photoId: files.photoId,

          userName: raw.alisName,
          commissionExpiryDate: raw.commissionExpiryDate?.toISOString() ?? null,

          photoIdName:
            raw.photoId?.name ?? this.originalDocNames().photoIdName,

          notaryCommissionCertificateName:
            raw.commissionCertificate?.name ??
            this.originalDocNames().commissionCertificateName,

          additionalCertificateName:
            raw.additionalCertificate?.name ??
            this.originalDocNames().additionalCertificateName
        })),
 
        map(({ commissionCertificate, ...payload }) => payload),
        switchMap(payload => this.http.postNotaryProfile(payload))
      )
      .subscribe();
  }


  /* ================= SEALS ================= */

  get sealsArray(): FormArray {
    return this.form.get('seals') as FormArray;
  }

  private patchSeals(seals: SealResponse[]): void {
    this.sealsArray.clear();
    seals.forEach(s =>
      this.sealsArray.push(
        this.fb.group({
          sealStyle: [s.sealStyle],
          sealUpperText: [s.sealUpperText],
          sealLowerText: [s.sealLowerText],
          sealExpiryDate: s.sealExpiryDate ? new Date(s.sealExpiryDate) : null,
          sealBase64Content: [s.sealBase64Content],
          notaryId: [s.notaryId]
        })
      )
    );
  }

  sealImage(v: string): string {
    return `data:image/png;base64,${this.stripPrefix(v)}`;
  }

  openCalendlyConfig(): void {
    window.open('https://calendly.com/app/scheduling/meeting_types/user/me', '_blank');
  }

    removeFile(control: 'commissionCertificate' | 'additionalCertificate'): void {
    this.form.controls[control].setValue(null);
    this.docPreviews.set({ ...this.docPreviews(), [control]: undefined });
  }

  openPdfPreview(base64: string): void {
  const pureBase64 = base64.includes(',')
    ? base64.split(',')[1]
    : base64;

  const byteChars = atob(pureBase64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }

  const blob = new Blob([new Uint8Array(byteNumbers)], {
    type: 'application/pdf'
  });

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

}
