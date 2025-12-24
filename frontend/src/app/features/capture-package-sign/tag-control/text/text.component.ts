import { Component } from '@angular/core';
import { BaseTagComponent } from '../../abstract-base-tag';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent extends BaseTagComponent {

}
