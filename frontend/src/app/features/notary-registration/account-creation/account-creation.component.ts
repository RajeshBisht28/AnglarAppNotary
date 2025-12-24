import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/core';
import { NotaryRegistrationService } from 'src/app/core/services/business';
import { CompleteRegistration } from 'src/app/models/notary-registration.model';
import { NotaryRegistrationStoreService } from '../service/notary-registration-store.service';
import { SHARED_IMPORTS } from 'src/app/shared';
import { SignupSuccessComponent } from '../signup-success/signup-success.component';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, SignupSuccessComponent],
  selector: 'notary-account-creation',
  templateUrl: './account-creation.component.html',
  styleUrls: ['./account-creation.component.scss']
})
export class AccountCreationComponent {
  @Input() accountData: any;
  @Output() complete = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  accountForm: FormGroup;
  hidePassword = true;
  notaryId!: string | null;
  isRegistrationComplete = false;

  constructor(private fb: FormBuilder,
    private apiService: NotaryRegistrationService,
    private notificationService: NotificationService,
    private registrationStore: NotaryRegistrationStoreService
  ) {
    this.notaryId = this.registrationStore.getNotaryId();
    this.accountForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      altEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      termsAccepted: [false, [Validators.requiredTrue]],
      avConsent: [false, Validators.requiredTrue]
    });
  }

  get avConsent() {
  return this.accountForm.get('avConsent');
}


  onSubmit() {
    if (this.accountForm.invalid) {
      return this.notificationService.showError("Please fill all required fields correctly.");
    }

    const payload: CompleteRegistration = {
      id: this.notaryId!,
      altEmail: this.accountForm.value.altEmail,
      userName: this.accountForm.value.username,
      password: this.accountForm.value.password
    };

    this.apiService.completeRegistration(payload).subscribe({
      next: res => {
        if (res.status) {
          this.complete.emit(this.accountForm.value);
          this.isRegistrationComplete = true;
        } else {
          return this.notificationService.showError("Somthing went wrong");
        }
      },
    });
  }
}