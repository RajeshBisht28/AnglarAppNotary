import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotaryStapperComponent, SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, NotaryStapperComponent],
  selector: 'notary-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent {
  currentStep = 1;

  userForm: FormGroup;
  scheduleForm: FormGroup;
  paymentForm: FormGroup;

  uploadedFiles: File[] = [];
  availableTimeSlots: string[] = [
    '9:00 AM - 10:00 AM',
    '10:30 AM - 11:30 AM',
    '1:00 PM - 2:00 PM',
    '2:30 PM - 3:30 PM',
    '4:00 PM - 5:00 PM'
  ];

  steps = [
  { label: 'User Information', icon: 'person' },
  { label: 'Upload Documents', icon: 'cloud_upload' },
  { label: 'Schedule Session', icon: 'calendar_today' },
  { label: 'Payment', icon: 'payment' }
];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]]
    });

    this.scheduleForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      nameOnCard: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.uploadedFiles.push(files[i]);
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitForm(): void {
    // Handle form submission
    console.log({
      userInfo: this.userForm.value,
      documents: this.uploadedFiles,
      schedule: this.scheduleForm.value,
      payment: this.paymentForm.value
    });

    // Show success message or redirect
    alert('Your notary session has been scheduled successfully!');
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.userForm.valid;
      case 2:
        return this.uploadedFiles.length > 0;
      case 3:
        return this.scheduleForm.valid;
      case 4:
        return this.paymentForm.valid;
      default:
        return false;
    }
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}
