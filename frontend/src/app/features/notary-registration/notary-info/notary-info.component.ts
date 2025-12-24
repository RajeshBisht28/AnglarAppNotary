import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/core';
import { NotaryRegistrationService } from 'src/app/core/services/business/notary-registration.service';
import { NotaryInformation } from 'src/app/models/notary-registration.model';
import { NotaryRegistrationStoreService } from '../service/notary-registration-store.service';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent],
  selector: 'notary-info',
  templateUrl: './notary-info.component.html',
  styleUrls: ['./notary-info.component.scss'],
  providers: [DatePipe]
})
export class NotaryInfoComponent {
  @Input() notaryData: any;
  @Output() complete = new EventEmitter<any>();

  notaryForm: FormGroup;

  constructor(private fb: FormBuilder,
    private apiService: NotaryRegistrationService,
     private notificationService: NotificationService,
     private registrationStore: NotaryRegistrationStoreService,
     private datePipe: DatePipe
  ) {
    this.notaryForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      commissionNumber: ['', [Validators.required]],
      commissionExpiryDate: ['', [Validators.required]],
      jurisdiction: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

    onSubmit() {
    if (this.notaryForm.valid) {
      let data: NotaryInformation = { ...this.notaryForm.value };

      if (data.commissionExpiryDate) {
        data.commissionExpiryDate = this.datePipe.transform(
          data.commissionExpiryDate,
          'yyyy-MM-dd HH:mm:ss'
        ) as string;
      }

      this.apiService.registerInformation(data).subscribe({
        next: res => {
          if (res.id) {
            this.registrationStore.setNotaryId(res.id);
            this.complete.emit(data);
          } else {
            this.notificationService.showError("Something went wrong!");
          }
        }
      });
    }
  }
}