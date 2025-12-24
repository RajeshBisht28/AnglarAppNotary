import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { StatCard } from 'src/app/models/dashboard.models';

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './stats-grid.component.html',
  styleUrls: ['./stats-grid.component.scss']
})
export class StatsGridComponent {
  @Input() stats: StatCard[] = [];
  @Output() statClick = new EventEmitter<number>();

  onStatCardClick(index: number): void {
    this.statClick.emit(index);
  }
}
