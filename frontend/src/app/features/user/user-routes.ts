import { Routes } from '@angular/router';
import { UserShellComponent } from './user-shell/user-shell.component';
import { UserDashboardComponent } from './dashboard/user-dashboard.component';
import { DocumentVaultComponent } from './document-vault/document-vault.component';
import { UpcomingSessionsComponent } from './upcoming-sessions/upcoming-sessions.component';
import { FavoriteNotaryComponent } from './favorite-notary/favorite-notary.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'document-vault', component: DocumentVaultComponent },
      { path: 'upcoming-sessions', component: UpcomingSessionsComponent },
      { path: 'favorite-notary', component: FavoriteNotaryComponent }
    ]
  }
];
