import { Component, EventEmitter, Output } from '@angular/core';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  selector: 'session-schedule-instant',
  imports: [...SHARED_IMPORTS],
  templateUrl: './schedule-instant.component.html',
  styleUrls: ['./schedule-instant.component.scss']
})
export class ScheduleInstantComponent {
  @Output() startNow = new EventEmitter<void>();
}
