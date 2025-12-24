import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotaryHeaderComponent } from '../notary-header/notary-header.component';
import { NotarySidebarComponent } from '../notary-sidebar/notary-sidebar.component';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { MatDrawerMode } from '@angular/material/sidenav';

@Component({
  selector: 'app-notary-user-shell',
  standalone: true,
  imports: [...MATERIAL_IMPORTS, RouterModule, NotaryHeaderComponent, NotarySidebarComponent],
  templateUrl: './notary-user-shell.component.html',
  styleUrls: ['./notary-user-shell.component.scss']
})
export class NotaryUserShellComponent {

  mode: MatDrawerMode = 'side';
  opened = true;
}
