import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { UserService, MenuItem } from '../services/user.service';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.scss']
})
export class UserSidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  activeRoute = '';
  user: any;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private router: Router
  ) {
    this.activeRoute = this.router.url;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.activeRoute = this.router.url;
    });
    this.user = authService.getUser();
  }

  ngOnInit(): void {
    this.userService.getMenuItems().subscribe(items => {
      this.menuItems = items;
    });
  }

  isActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
