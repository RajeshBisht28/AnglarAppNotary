import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SHARED_IMPORTS } from 'src/app/shared';

export type ScheduleChoice = 'later' | 'instant';

@Component({
  standalone: true,
  selector: 'session-schedule-options',
  imports: [...SHARED_IMPORTS],
  templateUrl: './schedule-options.component.html',
  styleUrls: ['./schedule-options.component.scss']
})
export class ScheduleOptionsComponent {
  @Input() selected: ScheduleChoice | null = null;
  @Output() choose = new EventEmitter<ScheduleChoice>();

  select(choice: ScheduleChoice) {
    this.choose.emit(choice);
  }
}
