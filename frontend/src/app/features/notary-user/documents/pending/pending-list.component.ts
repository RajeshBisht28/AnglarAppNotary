import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackagesTableComponent } from '../packages-table/packages-table.component';

@Component({
  selector: 'app-pending-list',
  standalone: true,
  imports: [CommonModule, PackagesTableComponent],
  template: `<app-packages-table title="Pending" statusFilter="Pending"></app-packages-table>`
})
export class PendingListComponent {}
