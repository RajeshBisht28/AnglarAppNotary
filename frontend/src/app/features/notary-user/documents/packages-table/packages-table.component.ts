import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditTrailPanelComponent, JournalSidebarComponent, LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { Subscription } from 'rxjs';
import { UserPackage } from 'src/app/models/package.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { downloadZipFromUrl } from 'src/app/utils/download-doc-util';
import { Router } from '@angular/router';
export interface PackageItem {
  accountId: number;
  isPaymentDone: string;
  isDeleted: string;
  emailMessage: string;
  lnPackageStatus: string;
  id: string;
  idDocumentVerified: string;
  lnPackageDesc: string;
  lnPackageName: string;
}

@Component({
  selector: 'app-packages-table',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, LoadingComponent, AuditTrailPanelComponent, JournalSidebarComponent],
  templateUrl: './packages-table.component.html',
  styleUrls: ['./packages-table.component.scss']
})
export class PackagesTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() statusFilter: 'inbox' | 'signed' | 'Pending' | 'draft' = 'inbox';

  query = '';
  displayedColumns: string[] = ['name', 'description', 'status', 'actions'];
  dataSource = new MatTableDataSource<PackageItem>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isAuditTrailOpen = false;
  selectedPackageId!: string;

  isJournalSidebarOpen = false;
  journalPackageId!: string;

  private sub?: Subscription;

  constructor(private notaryUserApi: NotaryUserAPIService,
     private packageService: PackageApiService,
     private notify: NotificationService,
     private router: Router) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilter(val: string) {
    this.query = val;
    this.dataSource.filter = (val || '').trim().toLowerCase();
  }

  private loadPackages() {
    this.sub = this.notaryUserApi.getPackages(this.statusFilter).subscribe({
      next: (data: PackageItem[]) => {
        const rows = Array.isArray(data) ? data : [];
        this.dataSource = new MatTableDataSource(rows);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (d: PackageItem, f: string) => {
          const text = `${d.lnPackageName} ${d.lnPackageDesc} ${d.lnPackageStatus}`.toLowerCase();
          return text.includes((f || '').toLowerCase());
        };
      },
    });
  }

  actionsFor(p: PackageItem): { icon: string; label: string }[] {
    const status = (p.lnPackageStatus || '').toLowerCase();
    if (status === 'draft' || status === 'created') {
      return [
        { icon: 'visibility', label: 'View' },
        { icon: 'edit', label: 'Edit' },
        { icon: 'send', label: 'Send' },
        { icon: 'delete', label: 'Delete' }
      ];
    }
    if (status === 'pending' || status === 'awaiting' || status === 'in-progress') {
      return [
        { icon: 'visibility', label: 'View' },
        { icon: 'notifications', label: 'Remind' },
        { icon: 'cancel', label: 'Cancel' }
      ];
    }
    if (status === 'signed' || status === 'completed') {
      return [
        { icon: 'visibility', label: 'View' },
        { icon: 'download', label: 'Download' }
      ];
    }
    return [
      { icon: 'visibility', label: 'View' }
    ];
  }

  onAction(action: string, p: PackageItem) {
    // Hook up real behaviors here as needed (view/download/etc.)
    this.createSessionAndEmail(p);
  }

  onAuditTrail(p: PackageItem) {
     this.selectedPackageId = p.id;
     this.isAuditTrailOpen = true;
  }

  closeAuditTrail(): void {
    this.isAuditTrailOpen = false;
  }

  onJournal(p: PackageItem): void {
    this.journalPackageId = p.id;
    this.isJournalSidebarOpen = true;
  }

  closeJournalSidebar(): void {
    this.isJournalSidebarOpen = false;
  }

  createSessionAndEmail(p: PackageItem) {
    // this.notaryUserApi.createSession(p.id)
    // .subscribe(data=>{
    //    this.notaryUserApi.sendEmailSession(p.id)
    //    .subscribe(emailSession=>{
         
    //    })
    // })
  }

  onDownload(pkg: UserPackage): void {
    if (pkg.isPaymentDone.toString() === 'N') {
      this.notify.showError("Payment is pending for this package. Please complete the payment to download the documents.");
      return;
    }
    this.packageService.downloadDocument(pkg.id).subscribe({
      next: (url: string) => {
        downloadZipFromUrl(url, `${pkg.lnPackageName}.zip`);
      },
    });
  }

  onContinue(pkg: UserPackage) {
    this.router.navigate(['/document/package', pkg.id, 'document']);
  }
}
