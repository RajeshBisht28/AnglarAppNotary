import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/core';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'notary-dashboard-header',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class NotaryDashboardHeaderComponent {
  @Input() firstName: string = 'User';
  @Output() notarizeClick = new EventEmitter<void>();

  user: any;

  constructor(public authService: AuthService) {
    this.user = authService.getUser();
  }

  onNotarizeNow(): void {
    this.notarizeClick.emit();
  }
}
