import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { StepService } from '../service/step.service';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { AuthService, NotificationService } from 'src/app/core';
import { Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { User } from 'src/app/models/auth.models';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent, DragDropModule],
  selector: 'participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit, OnDestroy {
  participantsForm: FormGroup;
  packageId!: string | null | undefined;
  loading = false;
  private sub: Subscription = new Subscription();
  userDetail: User | undefined

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private stepService: StepService,
    private packageServiceApi: PackageApiService,
    private notificationService: NotificationService,
    private saveForLaterService: StepService,
    private authUser: AuthService,
  ) {
    this.userDetail = authUser.getUser();

    this.participantsForm = this.fb.group({
      participants: this.fb.array([])
    });

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
      this.loadExistingParticipants(this.packageId);
    }
    this.sub.add(this.stepService.next$.subscribe(() => this.onNext()));
    this.sub.add(this.stepService.prev$.subscribe(() => this.onPrevious()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get participants(): FormArray {
    return this.participantsForm.get('participants') as FormArray;
  }

  createParticipantForm(data?: any): FormGroup {
    const group = this.fb.group({
      signerSeq: [data?.signerSeq || this.participants.length + 1, [Validators.required, Validators.min(1)]],
      signerFirstName: [data?.signerFirstName || '', [Validators.required, Validators.minLength(2)]],
      signerLastName: [data?.signerLastName || '', [Validators.required, Validators.minLength(2)]],
      signerEmail: [data?.signerEmail || '', [Validators.required, Validators.email]],
      signerType: [data?.signerType || 'Applicant', Validators.required],
      dob: [data?.dob || null],
      signerId: [data?.signerId || '']
    });

    this.setupDobSync(group);
    return group;
  }

  private setupDobSync(group: FormGroup): void {
    const typeCtrl = group.get('signerType');
    const dobCtrl = group.get('dob');
    if (!typeCtrl || !dobCtrl) return;

    const apply = (type: string) => {
      if (type === 'Applicant') {
        //dobCtrl.clearValidators();
        dobCtrl.setValidators([Validators.required]);
        dobCtrl.enable({ emitEvent: false });
        dobCtrl.updateValueAndValidity({ emitEvent: false });
      } else if (type === 'Signer') {
        dobCtrl.setValidators([Validators.required]);
        //dobCtrl.clearValidators();
        dobCtrl.enable({ emitEvent: false });
        dobCtrl.updateValueAndValidity({ emitEvent: false });
      } else {
        dobCtrl.clearValidators();
        dobCtrl.setValue(null, { emitEvent: false });
        dobCtrl.disable({ emitEvent: false });
        dobCtrl.updateValueAndValidity({ emitEvent: false });
      }
    };

    apply(typeCtrl.value);
    this.sub.add(typeCtrl.valueChanges.subscribe((val: string) => apply(val)));
  }

  addParticipant(): void {
    const participantForm = this.createParticipantForm();
    this.participants.push(participantForm);
    this.updateSequenceNumbers();
  }

  removeParticipant(index: number, participant: any): void {
    if (this.participants.length > 1) {

      this.participants.removeAt(index);
      const removedItem = participant.value;
      if (removedItem?.signerId) {
        this.deleteParticipant(removedItem.signerId);
      }

      this.updateSequenceNumbers();
    }
  }


  private updateSequenceNumbers(): void {
    this.participants.controls.forEach((control, index) => {
      control.get('signerSeq')?.setValue(index + 1);
    });
  }

  drop(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.participants.controls, event.previousIndex, event.currentIndex);
    this.participants.updateValueAndValidity();
    this.updateSequenceNumbers();
  }

  private loadExistingParticipants(packageId: string): void {
    this.packageServiceApi.getAllParticipants(packageId).subscribe({
      next: (res) => {
        if (res && res.signerDetails && res.signerDetails.length > 0) {
          res.signerDetails.forEach((participant: any) => {
            this.participants.push(this.createParticipantForm(participant));
          });
          this.updateSequenceNumbers();
        } else {
          this.addParticipant();
        }
      },
    });
  }

  onPrevious(): void {
    if (this.packageId) {
      this.router.navigate(['/document/package', this.packageId, 'document']);
    }
  }

  onNext(): void {
    if (this.participantsForm.valid && this.packageId) {

      // 1️⃣ Map UI participants
      let signerDetails = this.participantsForm.value.participants.map(
        (p: any) => ({
          signerId: p.signerId || "",
          envelopeId: this.packageId,
          signerFirstName: p.signerFirstName,
          signerLastName: p.signerLastName,
          signerEmail: p.signerEmail,
          signerName: `${p.signerFirstName} ${p.signerLastName}`,
          signerType: p.signerType,
          creatorAsSignor: true,
          dob: p.dob
        })
      );

      const notaryExists = this.hasNotarySigner(signerDetails);

      if (!notaryExists) {
        signerDetails.push(this.buildDummyNotarySigner());
      }

      signerDetails = signerDetails.map((s: any, index: number) => ({
        ...s,
        signerSeq: index + 1
      }));

      const payload = {
        envelopeId: this.packageId,
        signerDetails
      };

      this.packageServiceApi.addPariicipants(this.packageId, payload).subscribe({
        next: (res) => {
          if (res.status === '0') {
            this.stepService.saveStepData(this.packageId!, 'participants', payload);
            this.stepService.markStepCompleted(this.packageId!, 'participants');
            this.router.navigate(['/document/package', this.packageId, 'sign']);
          } else {
            this.notificationService.showError("Something went wrong!");
          }
        }
      });
    }
  }


  isFormValid(): boolean {
    return this.participantsForm.valid && this.participants.length > 0;
  }

  deleteParticipant(id: string) {
    this.packageServiceApi.deleteParticipants(this.packageId, id)
      .subscribe({
        next: () => {
        },
      });
  }

  private buildDummyNotarySigner(): any {
    return {
      signerId: "",
      envelopeId: this.packageId,
      signerFirstName: "Notary",
      signerLastName: "User",
      signerSeq: 1,
      signerEmail: "TBD@TBD.com",
      signerName: "FullName",
      signerType: "Notary",
      creatorAsSignor: true
    };
  }

  private hasNotarySigner(signers: any[]): boolean {
    return signers?.some(
      s => String(s.signerType).toLowerCase() === 'notary'
    );
  }

  saveForLater() {

    if (this.participantsForm.valid && this.packageId) {

      let signerDetails = this.participantsForm.value.participants.map(
        (p: any) => ({
          signerId: p.signerId || "",
          envelopeId: this.packageId,
          signerFirstName: p.signerFirstName,
          signerLastName: p.signerLastName,
          signerEmail: p.signerEmail,
          signerName: `${p.signerFirstName} ${p.signerLastName}`,
          signerType: p.signerType,
          creatorAsSignor: true,
          dob: p.dob
        })
      );

      const notaryExists = this.hasNotarySigner(signerDetails);

      if (!notaryExists) {
        signerDetails.push(this.buildDummyNotarySigner());
      }

      signerDetails = signerDetails.map((s: any, index: number) => ({
        ...s,
        signerSeq: index + 1
      }));

      const payload = {
        envelopeId: this.packageId,
        signerDetails
      };

      this.packageServiceApi.addPariicipants(this.packageId, payload).subscribe({
        next: (res) => {
          if (res.status === '0') {
            if (this.userDetail?.userType === 'User') {
              this.router.navigate(['/user/dashboard']);
            } else {
              this.router.navigate(['/notary-user/dashboard']);
            }
          } else {
            this.notificationService.showError("Something went wrong!");
          }
        }
      });
    }
  }

}
