import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AdminMenuItem, AdminService } from '../service/admin.service';
import { LoadingComponent, MATERIAL_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent  implements OnInit {
  menuItems: AdminMenuItem[] = [];
  activeRoute = '';

  constructor(
    private userService: AdminService,
    private router: Router
  ) {
    this.activeRoute = this.router.url;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.activeRoute = this.router.url;
    });
  }

  ngOnInit(): void {
    this.userService.getMenuItems().subscribe((items: AdminMenuItem[]) => {
      this.menuItems = items;
    });
  }

  isActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
