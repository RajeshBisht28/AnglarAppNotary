import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AdminApiService } from 'src/app/core';
import { LoadingComponent, MATERIAL_IMPORTS } from 'src/app/shared';
import { FormsModule } from '@angular/forms';

export interface Account {
  id: number;
  name: string;
  type: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS, LoadingComponent, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'actions'];
  dataSource = new MatTableDataSource<Account>([]);
  searchKey = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
      private adminApiService: AdminApiService,
    ) {
    }

  ngOnInit(): void {
    this.fetchAccounts();
  }

  fetchAccounts(): void {
    this.adminApiService.getAccounts().subscribe({
      next: (res: any) => {
        this.dataSource.data = res || [];
      },
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  clearFilter() {
    this.searchKey = '';
    this.dataSource.filter = '';
  }

  onEdit(account: Account) {
    console.log('Edit account', account);
  }

  onDelete(account: Account) {
    console.log('Delete account', account);
  }
}
