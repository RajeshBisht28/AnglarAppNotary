import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { JournalEntry } from 'src/app/models/journal.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { downloadZipFromUrl } from 'src/app/utils/download-doc-util';

@Component({
  selector: 'app-journal-sidebar',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './journal-sidebar.component.html',
  styleUrls: ['./journal-sidebar.component.scss']
})
export class JournalSidebarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() packageId: string = '';
  @Input() isOpen: boolean = false;
  @Output() closePanel = new EventEmitter<void>();

  journalEntry: JournalEntry | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  constructor(private notaryUserApi: NotaryUserAPIService) {}

  ngOnInit(): void {
    if (this.isOpen && this.packageId) {
      this.loadJournalEntry();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['packageId']) {
      if (this.isOpen && this.packageId) {
        this.loadJournalEntry();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadJournalEntry(): void {
    if (!this.packageId) {
      this.errorMessage = 'Package ID is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.notaryUserApi
      .getPackageJournal(this.packageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entries: JournalEntry) => {
          this.journalEntry = entries;
          if (!this.journalEntry) {
            this.errorMessage = 'No journal entry found for this package';
          }
          this.isLoading = false;
        },
      });
  }

  close(): void {
    this.closePanel.emit();
  }

  downloadRecordSession(entry: JournalEntry): void {
    if (entry?.videoRecordingLink) {
      downloadZipFromUrl(entry.videoRecordingLink, `${entry.packageName}-recording`);
    }
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
