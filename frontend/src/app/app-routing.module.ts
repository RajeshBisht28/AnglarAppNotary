import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "welcome"
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./features/welcome/welcome-routes').then(m => m.welcomeRoutes)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard-routes').then(m => m.dashboardRoutes),
    canActivate: [authGuard] 
  },
  {
    path: 'document',
    loadChildren: () =>
      import('./features/document/document-routes').then(m => m.documentRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'notary-registration',
    loadChildren: () =>
      import('./features/notary-registration/notary-registration-routes').then(m => m.notaryRegiRoutes),
   // canActivate: [authGuard]
  },
  {
    path: 'video-session',
    loadChildren: () =>
      import('./features/notarization/notarization-routes').then(m => m.notarizationRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-routes').then(m => m.authRoutes)
  },
  {
    path: 'eNotary',
    loadChildren: () => import('./features/identity-capture/identity-capture-routes').then(m => m.identityCaptureRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'notary-user',
    loadChildren: () => import('./features/notary-user/notary-user-routes').then(m => m.notaryUserRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./features/user/user-routes').then(m => m.userRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-routes').then(m => m.adminRoutes),
    canActivate: [authGuard]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
