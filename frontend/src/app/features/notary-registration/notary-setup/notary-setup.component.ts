import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'notary-setup',
  templateUrl: './notary-setup.component.html',
  styleUrls: ['./notary-setup.component.scss']
})
export class NotarySetupComponent {
 constructor(private router: Router) {}

  startOnboarding() {
    this.router.navigate(['/notary-registration/onboarding']);
  }
}
