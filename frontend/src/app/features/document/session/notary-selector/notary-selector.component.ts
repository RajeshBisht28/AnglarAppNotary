import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { SHARED_IMPORTS } from 'src/app/shared';
import { Notary, SessionType } from 'src/app/models/notary.model';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'notary-selector',
  imports: [...SHARED_IMPORTS],
  templateUrl: './notary-selector.component.html',
  styleUrls: ['./notary-selector.component.scss']
})
export class NotarySelectorComponent implements OnInit, OnDestroy {
  @Input() sessionType!: SessionType;
  @Input() packageId!: string;
  @Output() notarySaved = new EventEmitter<Notary>();

  notaries: Notary[] = [];
  selectedNotary: Notary | null = null;
  isLoading = false;
  isSaving = false;
  private sub = new Subscription();

  constructor(
    private notaryApi: NotaryUserAPIService,
    private loadingService: LoadingService,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadNotaries();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadNotaries(): void {
    this.isLoading = true;
    this.loadingService.show();
    const type = this.sessionType === 'Instant' ? 'Instant' : 'Scheduled';

    this.sub.add(
      this.notaryApi.fetchNotaries(type).subscribe({
        next: (data) => {
          this.notaries = Array.isArray(data) ? data : data.notaries || [];
          this.isLoading = false;
          this.loadingService.hide();
        },
        error: (err) => {
          this.isLoading = false;
          this.loadingService.hide();
          console.error('Failed to load notaries:', err);
          this.notify.showError('Failed to load available notaries. Please try again.');
        }
      })
    );
  }

  selectNotary(notary: Notary): void {
    this.selectedNotary = notary;
  }

  continueWithNotary(): void {
    if (!this.selectedNotary) {
      this.notify.showError('Please select a notary to continue');
      return;
    }

    if (!this.packageId) {
      this.notify.showError('Package ID is missing');
      return;
    }

    this.isSaving = true;
    this.loadingService.show();

    this.sub.add(
      this.notaryApi.setAsSigner(this.packageId, this.selectedNotary.notaryId).subscribe({
        next: (data) => {
          this.isSaving = false;
          this.loadingService.hide();
          this.notify.showSuccess('Notary assigned successfully');
          this.notarySaved.emit(this.selectedNotary!);
        },
        error: (err) => {
          this.isSaving = false;
          this.loadingService.hide();
          console.error('Failed to save notary:', err);
          this.notify.showError('Failed to assign notary. Please try again.');
        }
      })
    );
  }

  getNotaryDisplayName(notary: Notary): string {
    return `${notary.firstName} ${notary.lastName}`;
  }
}
