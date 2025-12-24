import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_IMPORTS } from 'src/app/shared';


@Component({
  selector: 'app-account-card',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS],
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss']
})
export class AccountCardComponent {
  @Input() userName: string = 'User Name';
  @Input() userInitials: string = 'UN';
  @Input() description: string = 'One account for everything you do with Leaflet eNotary. Sign, verify, or connect with the Notarize Network.';
  @Output() manageAccount = new EventEmitter<void>();

  onManageAccount(): void {
    this.manageAccount.emit();
  }
}
