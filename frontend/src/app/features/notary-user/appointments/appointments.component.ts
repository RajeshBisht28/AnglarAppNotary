import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SHARED_IMPORTS } from 'src/app/shared';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RescheduleSessionDialogComponent } from 'src/app/shared/components/reschedule-session-dialog/reschedule-session-dialog.component';

export interface PackageItem {
  accountId: number;
  isPaymentDone: string;
  isDeleted: string;
  emailMessage: string;
  lnPackageStatus: string;
  id: number;
  idDocumentVerified: string;
  meAsSignerId: number;
  lnPackageDesc: string;
  lnPackageName: string;
  createdDate?: string;
  scheduleDateTime?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
  formattedScheduledDateTime?: string;
  scheduledStatus?: string;
}

@Component({
  selector: 'app-notary-appointments',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['lnPackageName', 'lnPackageDesc', 'lnPackageStatus', 'scheduleDateTime', 'actions'];
  dataSource = new MatTableDataSource<PackageItem>([]);
  originalData: PackageItem[] = [];
  sub!: Subscription;

  statusFilter = 'UpcomingSessions';
  selectedDate: Date | null = new Date();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private notaryUserApi: NotaryUserAPIService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      const hasAppointment = this.originalData.some(pkg => {
        const apiDate = pkg.scheduleDateTime?.split(' ')[0];
        return apiDate === dateStr;
      });
      return hasAppointment ? 'has-appointment' : '';
    }
    return '';
  };

  ngOnInit() {
    this.loadPackages();
  }

  private loadPackages() {
    this.sub = this.notaryUserApi.getPackages(this.statusFilter).subscribe({
      next: (data: PackageItem[]) => {
        this.originalData = Array.isArray(data) ? data : [];
        this.dataSource = new MatTableDataSource(this.originalData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       // this.filterByDate(this.selectedDate!);
      },
    });
  }

  dateFilter = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d ? d >= today : false;
  };

filterByDate(date: Date) {
  if (!date) return;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const selectedLocal = `${year}-${month}-${day}`; 

  this.dataSource.data = this.originalData.filter(pkg => {
    if (!pkg.scheduleDateTime) return false;

    const apiDatePart = pkg.scheduleDateTime.split(' ')[0];

    return apiDatePart === selectedLocal;
  });
}

  onDateChange(date: Date | null) {
  if (date) {
    this.selectedDate = date;
    this.filterByDate(date);
  }
}


  addPackage() {
    console.log('Add new package clicked');
  }

  joinAppointment(pkg: PackageItem): void {
  if (pkg?.id && pkg?.meAsSignerId) {
    this.router.navigate(['/video-session/package', pkg.id, 'signer', pkg.meAsSignerId]);
  }
}

  deletePackage(pkg: PackageItem) {
    console.log('Delete', pkg);
  }

  onRescheduleAppointment(pkg: PackageItem): void {
    window.open(pkg.rescheduleUrl);
    // this.dialog.open(RescheduleSessionDialogComponent, {
    //   width: '560px',
    //   disableClose: true,
    //   data: {
    //     packageId: pkg.id,
    //     packageName: pkg.lnPackageName,
    //     currentDateTime: pkg.scheduleDateTime,
    //     onReschedule: (date: string, time: string) =>
    //       this.notaryUserApi.scheduleSession(String(pkg.id), date, time)
    //   }
    // }).afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.loadPackages();
    //   }
    // });
  }

  onCancelAppointment(pkg: PackageItem): void{
    window.open(pkg.cancelUrl)
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
