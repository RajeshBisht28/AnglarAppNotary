import { Component } from '@angular/core';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'notary-signup-success',
  templateUrl: './signup-success.component.html',
  styleUrls: ['./signup-success.component.scss']
})
export class SignupSuccessComponent {

}
