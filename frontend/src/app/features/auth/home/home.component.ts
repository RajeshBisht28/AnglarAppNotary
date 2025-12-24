import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterModule],
  selector: 'notary-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

}
