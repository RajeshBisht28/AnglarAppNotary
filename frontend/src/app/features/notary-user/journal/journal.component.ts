import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalSidebarComponent, LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { Subscription } from 'rxjs';
import { JournalEntry } from 'src/app/models/journal.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { downloadZipFromUrl } from 'src/app/utils/download-doc-util';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, LoadingComponent, JournalSidebarComponent],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit, AfterViewInit, OnDestroy {
  query = '';
  displayedColumns: string[] = ['packageName', 'documentTitle', 'signerName', 'status', 'actions'];
  dataSource = new MatTableDataSource<JournalEntry>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isJournalSidebarOpen = false;
  journalPackageId!: string;

  private sub?: Subscription;

  constructor(
    private notaryUserApi: NotaryUserAPIService,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadJournal();
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

  private loadJournal() {
    this.sub = this.notaryUserApi.getJournal().subscribe({
      next: (data: JournalEntry[]) => {
        const rows = Array.isArray(data) ? data : [];
        this.dataSource = new MatTableDataSource(rows);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (d: JournalEntry, f: string) => {
          const text = `${d.packageName} ${d.documentTitle} ${d.signerName} ${d.status}`.toLowerCase();
          return text.includes((f || '').toLowerCase());
        };
      },
    });
  }

  downloadRecordSession(journal: JournalEntry) {
    if (journal?.videoRecordingLink) {
      downloadZipFromUrl(journal.videoRecordingLink, journal.packageName)
    }
  }

  onJournal(p: JournalEntry): void {
    this.journalPackageId = p.packageId;
    this.isJournalSidebarOpen = true;
  }

  closeJournalSidebar(): void {
    this.isJournalSidebarOpen = false;
  }
}
