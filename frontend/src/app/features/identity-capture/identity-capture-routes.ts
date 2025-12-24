import { Routes } from '@angular/router';
import { IdentityCaptureComponent } from './identity-capture.component';

export const identityCaptureRoutes: Routes = [
  { path: 'packages/:packageId/users/:userId/type/:docType/region/:region', component: IdentityCaptureComponent }
];
