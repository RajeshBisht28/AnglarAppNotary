import { Routes } from "@angular/router";
import { AdminShellComponent } from "./admin-shell/admin-shell.component";
import { AccountComponent } from "./account/account.component";
import { BrandingComponent } from "./branding/branding.component";


export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'accounts' },
      { path: 'accounts', component: AccountComponent },
      { path: 'branding', component: BrandingComponent },
    ]
  }
];
