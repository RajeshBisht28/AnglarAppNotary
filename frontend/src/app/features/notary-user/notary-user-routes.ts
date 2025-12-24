import { Routes } from '@angular/router';
import { NotaryUserShellComponent } from './notary-user-shell/notary-user-shell.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';

import { ClientsComponent } from './clients/clients.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { BillingComponent } from './billing/billing.component';
import { JournalComponent } from './journal/journal.component';
import { DocumentsShellComponent } from './documents/document-shell/documents-shell.component';
import { InboxListComponent } from './documents/inbox/inbox-list.component';
import { PendingListComponent } from './documents/pending/pending-list.component';
import { DraftListComponent } from './documents/draft/draft-list.component';
import { SignedListComponent } from './documents/signed/signed-list.component';
import { ProfileComponent } from './profile/profile.component';

export const notaryUserRoutes: Routes = [
  {
    path: '',
    component: NotaryUserShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardHomeComponent },
      {
        path: 'documents',
        component: DocumentsShellComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'inbox' },
          { path: 'inbox', component: InboxListComponent },
          { path: 'signed', component: SignedListComponent },
          { path: 'pending', component: PendingListComponent },
          { path: 'draft', component: DraftListComponent },
        ]
      },
      { path: 'clients', component: ClientsComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'journal', component: JournalComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'notary-profile', component: ProfileComponent },
    ]
  }
];
