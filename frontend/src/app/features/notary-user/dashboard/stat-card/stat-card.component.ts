import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StatCard } from 'src/app/models/dashboard.models';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'notary-stat-card',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class NotaryStatCardComponent {
  @Input() stat!: StatCard;
  @Output() cardClick = new EventEmitter<void>();

  onCardClick(): void {
    this.cardClick.emit();
  }
}
