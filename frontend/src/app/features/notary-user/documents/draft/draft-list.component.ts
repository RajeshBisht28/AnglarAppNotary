import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackagesTableComponent } from '../packages-table/packages-table.component';


@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [CommonModule, PackagesTableComponent],
  template: `<app-packages-table title="Draft" statusFilter="draft"></app-packages-table>`
})
export class DraftListComponent {}
