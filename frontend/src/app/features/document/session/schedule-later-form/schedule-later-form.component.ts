import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core';
import { SHARED_IMPORTS } from 'src/app/shared';

export interface ScheduleLaterRequest {
  date: string;
  time: string;
}

@Component({
  standalone: true,
  selector: 'session-schedule-later-form',
  imports: [...SHARED_IMPORTS],
  templateUrl: './schedule-later-form.component.html',
  styleUrls: ['./schedule-later-form.component.scss']
})
export class ScheduleLaterFormComponent implements OnInit {
  @Output() submitSchedule = new EventEmitter<ScheduleLaterRequest>();
  today = new Date();
  minDateTime = new Date();
  user: any

  form = this.fb.group({
    date: [null as Date | null, Validators.required],
    time: ['', Validators.required]
  });

  constructor(private fb: FormBuilder,
    private authUser: AuthService
  ) {
    this.user = this.authUser.getUser()
  }

  ngOnInit(): void {
    this.minDateTime.setHours(0, 0, 0, 0);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { date, time } = this.form.value;
    const payload: ScheduleLaterRequest = {
      date: this.formatDate(date as Date),
      time: time as string
    };
    this.submitSchedule.emit(payload);
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
