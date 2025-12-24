import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'notary-unverified-id-badge',
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="unverified-badge-wrapper">
      <mat-icon
        class="unverified-icon"
        matTooltip="This user's ID has not been verified."
        matTooltipPosition="below">
        info
      </mat-icon>
    </div>
  `,
  styles: [`
    .unverified-badge-wrapper {
      display: flex;
      align-items: center;
      margin-right: 8px;
    }

    .unverified-icon {
      cursor: pointer;
      color: #ff9800;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class UnverifiedIdBadgeComponent {
  @Input() displayName: string = 'Notary User';
}
