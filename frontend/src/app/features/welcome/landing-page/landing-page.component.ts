import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {

constructor(private router: Router) {}

  goToRegister() {
    this.router.navigate(['/document']);
  }
}
