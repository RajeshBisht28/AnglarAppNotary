import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AdminMenuItem {
  label: string;
  icon: string;
  route: string;
  children?: AdminMenuItem[];
}

@Injectable({
  providedIn: 'root'
})

export class AdminService {
 private menuItemsSubject = new BehaviorSubject<AdminMenuItem[]>([
    {
      label: 'Account',
      icon: 'dashboard',
      route: '/admin/accounts'
    },
    {
      label: 'Branding',
      icon: 'palette',
      route: '/admin/branding'
    },
  ]);

   menuItems$ = this.menuItemsSubject.asObservable();

  constructor() { }

  getMenuItems(): Observable<AdminMenuItem[]> {
      return this.menuItems$;
    }
}
