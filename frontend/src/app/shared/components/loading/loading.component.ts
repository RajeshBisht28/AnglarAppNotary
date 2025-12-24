import { Component, Input } from '@angular/core';
import { LoadingService } from 'src/app/core';
import { SHARED_IMPORTS } from '../../material/shared-import';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'notary-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']  
})
export class LoadingComponent {
  
  constructor(public loadingService: LoadingService,) {}

  @Input() loaderType!: string;
}
