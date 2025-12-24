import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackagesTableComponent } from '../packages-table/packages-table.component';


@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [CommonModule, PackagesTableComponent],
  template: `<app-packages-table title="Inbox" statusFilter="inbox"></app-packages-table>`
})
export class InboxListComponent {}
