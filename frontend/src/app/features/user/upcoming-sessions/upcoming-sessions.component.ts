import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_IMPORTS } from 'src/app/shared';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RescheduleSessionDialogComponent } from 'src/app/shared/components/reschedule-session-dialog/reschedule-session-dialog.component';

export interface UpcomingSession {
  id: number;
  lnPackageName: string;
  lnPackageDesc: string;
  lnPackageStatus: string;
  scheduleDateTime: string;
  status: string;
  notaryName?: string;
  meAsSignerId?: number;
  accountId?: number;
  formattedScheduledDateTime?: string;
  scheduledStatus?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
}

@Component({
  selector: 'app-upcoming-sessions',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS],
  templateUrl: './upcoming-sessions.component.html',
  styleUrls: ['./upcoming-sessions.component.scss']
})
export class UpcomingSessionsComponent implements OnInit {
  sessions: UpcomingSession[] = [];
  isLoading = false;
  statusFilter = 'UpcomingSessions';

  constructor(
    private notaryUserApi: NotaryUserAPIService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  private loadSessions(): void {
    this.isLoading = true;

    this.notaryUserApi.findUserPackages(this.statusFilter).subscribe({
      next: (res: UpcomingSession[]) => {
        this.sessions = Array.isArray(res) ? res : [];
        this.isLoading = false;
      }
    });
  }

  onJoinSession(session: UpcomingSession): void {
    if (session?.id && session?.meAsSignerId) {
    this.router.navigate(['/video-session/package', session.id, 'signer', session.meAsSignerId]);
  }
  }

  onRescheduleSession(session: UpcomingSession): void {
    window.open(session.rescheduleUrl);
    // this.dialog.open(RescheduleSessionDialogComponent, {
    //   width: '560px',
    //   disableClose: true,
    //   data: {
    //     packageId: session.id,
    //     packageName: session.lnPackageName,
    //     currentDateTime: session.scheduleDateTime,
    //     onReschedule: (date: string, time: string) =>
    //       this.notaryUserApi.scheduleSession(String(session.id), date, time)
    //   }
    // }).afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.loadSessions();
    //   }
    // });
  }

  onCancelSession(session: UpcomingSession): void {
    window.open(session.cancelUrl);
    //console.log('Cancel session:', session.id);
  }

  getStatusColor(status: string): string {
    if (!status) return 'status-default';
    switch (status.toLowerCase()) {
      case 'in progress':
      case 'in-progress':
        return 'status-inprogress';
      case 'completed':
        return 'status-completed';
      case 'scheduled':
        return 'status-scheduled';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    if (!status) return 'schedule';
    switch (status.toLowerCase()) {
      case 'in progress':
      case 'in-progress':
        return 'play_circle';
      case 'completed':
        return 'check_circle';
      case 'scheduled':
        return 'event';
      default:
        return 'schedule';
    }
  }
}
