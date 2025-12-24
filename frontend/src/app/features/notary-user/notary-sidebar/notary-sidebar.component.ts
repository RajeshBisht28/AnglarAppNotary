import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core';

@Component({
  selector: 'app-notary-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './notary-sidebar.component.html',
  styleUrls: ['./notary-sidebar.component.scss']
})
export class NotarySidebarComponent {
  isDocsOpen = false;
  user: any;

  constructor(private router: Router, public authService: AuthService,) {
    this.isDocsOpen = this.router.url.startsWith('/notary-user/documents');
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.isDocsOpen = this.router.url.startsWith('/notary-user/documents');
    });
    this.user = authService.getUser();
  }

  toggleDocs() { this.isDocsOpen = !this.isDocsOpen; }
}
