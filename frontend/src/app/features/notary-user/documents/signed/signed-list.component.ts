import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackagesTableComponent } from '../packages-table/packages-table.component';


@Component({
  selector: 'app-signed-list',
  standalone: true,
  imports: [CommonModule, PackagesTableComponent],
  template: `<app-packages-table title="Signed" statusFilter="signed"></app-packages-table>`
})
export class SignedListComponent {}
