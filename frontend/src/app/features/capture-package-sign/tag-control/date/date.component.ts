import { Component } from '@angular/core';
import { BaseTagComponent } from '../../abstract-base-tag';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-date',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent extends BaseTagComponent {
  rawDate: string = '';
}
