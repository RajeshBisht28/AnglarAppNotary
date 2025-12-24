import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StatCard } from 'src/app/models/dashboard.models';
import { NotaryStatCardComponent } from '../stat-card/stat-card.component';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'notary-stats-grid',
  standalone: true,
  imports: [...SHARED_IMPORTS, NotaryStatCardComponent],
  templateUrl: './stats-grid.component.html',
  styleUrls: ['./stats-grid.component.scss']
})
export class NotaryStatsGridComponent {
  @Input() stats: StatCard[] = [];
  @Output() statClick = new EventEmitter<number>();

  onStatCardClick(index: number): void {
    this.statClick.emit(index);
  }
}
