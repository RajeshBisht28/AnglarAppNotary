import { Routes } from '@angular/router';
import { NotaryRegistrationComponent } from './notary-registration/notary-registration.component';
import { NotarySetupComponent } from './notary-setup/notary-setup.component';

export const notaryRegiRoutes: Routes = [{
    path: "",
    component: NotarySetupComponent
  },
{
    path: "onboarding",
    component: NotaryRegistrationComponent
  },];

