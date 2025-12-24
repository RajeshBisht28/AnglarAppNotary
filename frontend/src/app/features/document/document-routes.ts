import { Routes } from '@angular/router';
import { DocumentShellComponent } from './document-shell/document-shell.component';
import { ParticipantsComponent } from './participants/participants.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { SessionComponent } from './session/session.component';
import { PaymentComponent } from './payment/payment.component';
import { stepGuard } from '../../core/guards/step.guard';
import { AddSignComponent } from './add-sign/add-sign.component';
import { IdVerificationComponent } from './id-verification/id-verification.component';

export const documentRoutes: Routes = [
  {
    path: 'package/:id',
    component: DocumentShellComponent,
    children: [
      {
        path: 'document',
        component: DocumentUploadComponent,
       /// canActivate: [stepGuard]
      },
      {
        path: 'participants',
        component: ParticipantsComponent,
       // canActivate: [stepGuard]
      },
      {
        path: 'sign',
        component: AddSignComponent,
        //canActivate: [stepGuard]
      },
      {
        path: 'id-verification/applicant/:signerId',
        component: IdVerificationComponent,
        // canActivate: [stepGuard]
      },
      {
        path: 'session/applicant/:signerId',
        component: SessionComponent,
       // canActivate: [stepGuard]
      },
      {
        path: 'payment',
        component: PaymentComponent,
       // canActivate: [stepGuard]
      },
      {
        path: '',
        redirectTo: 'document',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'package/1',
    pathMatch: 'full'
  }
];
