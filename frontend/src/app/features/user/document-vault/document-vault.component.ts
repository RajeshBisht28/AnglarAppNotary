import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent, SHARED_IMPORTS, AuditTrailPanelComponent } from 'src/app/shared';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { UserPackage } from 'src/app/models/package.model';
import { Subscription } from 'rxjs';
import { downloadZipFromUrl } from 'src/app/utils/download-doc-util';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import {  Router } from '@angular/router';
@Component({
  selector: 'app-document-vault',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, LoadingComponent, AuditTrailPanelComponent],
  templateUrl: './document-vault.component.html',
  styleUrls: ['./document-vault.component.scss']
})
export class DocumentVaultComponent implements OnInit, AfterViewInit, OnDestroy {
  searchQuery = '';
  displayedColumns: string[] = ['packageName', 'description', 'status', 'expirationOn', 'idDocumentVerified', 'paymentDone', 'actions'];
  dataSource = new MatTableDataSource<UserPackage>([]);
  isAuditTrailOpen = false;
  selectedPackageId = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private subscriptions: Subscription[] = [];

  constructor(private notaryUserAPIService: NotaryUserAPIService, private router: Router,
    private packageService: PackageApiService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadPackages(): void {
    const packagesSub = this.notaryUserAPIService.getUserPackages().subscribe({
      next: (packages: UserPackage[]) => {
        this.dataSource.data = packages;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (pkg: UserPackage, filter: string) => {
          const searchStr = `${pkg.lnPackageName} ${pkg.lnPackageDesc} ${pkg.lnPackageStatus}`.toLowerCase();
          return searchStr.includes(filter.toLowerCase());
        };
      },
    });
    this.subscriptions.push(packagesSub);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.dataSource.filter = query;
  }

  getSignersDisplay(pkg: UserPackage): { display: string; tooltip: string } {
    if (!pkg.signers || pkg.signers.length === 0) {
      return { display: 'No signers', tooltip: '' };
    }

    const signerNames = pkg.signers
      .map(s => s.firstName || s.name || '')
      .filter(name => name);

    if (signerNames.length <= 2) {
      return { display: signerNames.join(', '), tooltip: '' };
    }

    const firstTwo = signerNames.slice(0, 2);
    const remaining = signerNames.length - 2;
    const display = `${firstTwo.join(', ')} +${remaining}`;
    const tooltip = signerNames.join(', ');

    return { display, tooltip };
  }

  onMakePayment(pkg: UserPackage): void {
    this.router.navigate(['/document/package', pkg.id, 'payment']);
  }

  onDownload(pkg: UserPackage): void {
    console.log('Download package:', pkg);
    if(pkg.isPaymentDone.toString() === 'N'){
      this.notify.showError("Payment is pending for this package. Please complete the payment to download the documents.");
      return;
    }
    this.packageService.downloadDocument(pkg.id).subscribe({
      next: (url: string) => {
        downloadZipFromUrl(url, `${pkg.lnPackageName}.zip`);
      },
    });
  }

  onDelete(pkg: UserPackage): void {
    const index = this.dataSource.data.indexOf(pkg);
    if (index > -1) {
      const data = [...this.dataSource.data];
      data.splice(index, 1);
      this.dataSource.data = data;
    }
  }

  onViewPackage(pkg: UserPackage): void {
    console.log('View package:', pkg.id);
  } 

  onViewAuditTrail(pkg: UserPackage): void {
    this.selectedPackageId = pkg.id;
    this.isAuditTrailOpen = true;
  }

  closeAuditTrail(): void {
    this.isAuditTrailOpen = false;
  }

  joinSession(pkg: UserPackage) {
    this.router.navigate(['/video-session/package', pkg.id, 'signer', pkg.meAsSignerId]);
  }

  onContinue(pkg: UserPackage) {
    this.router.navigate(['/document/package', pkg.id, 'document']);
  }
}
