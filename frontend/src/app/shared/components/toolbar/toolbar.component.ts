import { Component, Input } from '@angular/core';
import { SHARED_IMPORTS } from '../../material/shared-import';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'notary-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() title: string = 'Notary Portal';
  @Input() showBackButton: boolean = false;
  @Input() showProgress: boolean = false;
  @Input() progressValue: number = 0;
}
