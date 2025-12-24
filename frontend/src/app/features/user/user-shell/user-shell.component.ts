import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserHeaderComponent } from '../user-header/user-header.component';
import { UserSidebarComponent } from '../user-sidebar/user-sidebar.component';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { MatDrawerMode } from '@angular/material/sidenav';

@Component({
  selector: 'app-user-shell',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS, RouterModule, UserHeaderComponent, UserSidebarComponent],
  templateUrl: './user-shell.component.html',
  styleUrls: ['./user-shell.component.scss']
})
export class UserShellComponent {
  
mode: MatDrawerMode = 'side';
opened = true;

}
