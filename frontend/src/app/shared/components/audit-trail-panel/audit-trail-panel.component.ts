import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from 'src/app/shared';
import { AuditLogAPIService } from 'src/app/core/services/business/audit-log-api.service';
import { AuditLogEntry } from 'src/app/models/audit-log.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-audit-trail-panel',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './audit-trail-panel.component.html',
  styleUrls: ['./audit-trail-panel.component.scss']
})
export class AuditTrailPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() packageId: string = '';
  @Input() isOpen: boolean = false;
  @Output() closePanel = new EventEmitter<void>();

  auditLogs: AuditLogEntry[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  constructor(private auditLogAPIService: AuditLogAPIService) {}

  ngOnInit(): void {
    if (this.isOpen && this.packageId) {
      this.loadAuditLogs();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['packageId']) {
      if (this.isOpen && this.packageId) {
        this.loadAuditLogs();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAuditLogs(): void {
    if (!this.packageId) {
      this.errorMessage = 'Package ID is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auditLogAPIService
      .getAuditLog(this.packageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs: AuditLogEntry[]) => {
          this.auditLogs = logs;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load audit logs:', error);
          this.errorMessage = 'Failed to load audit trail. Please try again.';
          this.isLoading = false;
        }
      });
  }

  close(): void {
    this.closePanel.emit();
  }

  getEventIcon(event: string): string {
    const iconMap: { [key: string]: string } = {
      'created': 'add_circle',
      'updated': 'edit',
      'signed': 'done',
      'uploaded': 'cloud_upload',
      'downloaded': 'cloud_download',
      'deleted': 'delete',
      'viewed': 'visibility',
      'sent': 'send',
      'received': 'mail',
      'completed': 'check_circle',
      'rejected': 'cancel',
      'approved': 'thumb_up'
    };
    return iconMap[event.toLowerCase()] || 'event_note';
  }
}
