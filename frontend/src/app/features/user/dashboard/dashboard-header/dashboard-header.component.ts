import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/core';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  @Input() firstName: string = 'User';
  @Output() notarizeClick = new EventEmitter<void>();

  user: any;

  constructor(public authService: AuthService
  ) {
    this.user = this.authService.getUser();
  }

  onNotarizeNow(): void {
    this.notarizeClick.emit();
  }
}
