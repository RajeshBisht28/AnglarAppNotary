import { Component } from '@angular/core';
import { NotaryStapperComponent, SHARED_IMPORTS, ToolbarComponent } from 'src/app/shared';
import { NotaryInfoComponent } from '../notary-info/notary-info.component';
import { ProfileCertificatesComponent } from '../profile-certificates/profile-certificates.component';
import { DigitalSealComponent } from '../digital-seal/digital-seal.component';
import { AccountCreationComponent } from '../account-creation/account-creation.component';
import { SignupSuccessComponent } from '../signup-success/signup-success.component';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, NotaryStapperComponent, NotaryInfoComponent, ProfileCertificatesComponent,
    DigitalSealComponent, AccountCreationComponent, ToolbarComponent, SignupSuccessComponent
  ],
  selector: 'notary-registration',
  templateUrl: './notary-registration.component.html',
  styleUrls: ['./notary-registration.component.scss']
})
export class NotaryRegistrationComponent {

currentStep = 1;

  steps = [
    { label: 'Notary Information', icon: 'badge' },
    { label: 'Profile & Certificates', icon: 'redeem' },
    { label: 'Digital Seal', icon: 'approval' },
    { label: 'Account Creation', icon: 'person_add' }
  ];

  registrationData = {
    notaryInfo: null,
    profileData: null,
    sealData: null,
    accountData: null
  };

  onStepComplete(stepData: any, stepNumber: number) {
    switch(stepNumber) {
      case 1: this.registrationData.notaryInfo = stepData; break;
      case 2: this.registrationData.profileData = stepData; break;
      case 3: this.registrationData.sealData = stepData; break;
      case 4: this.registrationData.accountData = stepData; break;
    }
    this.nextStep();
  }

  nextStep() {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    } else if (this.currentStep === this.steps.length) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  completeRegistration() {
    console.log('Registration completed:', this.registrationData);
  }
}
