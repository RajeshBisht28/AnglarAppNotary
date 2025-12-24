import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from 'src/app/shared';

interface AppointmentItem { when: string; who: string; type: string; }

@Component({
  selector: 'app-upcoming-appointments',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './upcoming-appointments.component.html',
  styleUrls: ['./upcoming-appointments.component.scss']
})
export class UpcomingAppointmentsComponent {
  @Input() items: AppointmentItem[] = [];
}
