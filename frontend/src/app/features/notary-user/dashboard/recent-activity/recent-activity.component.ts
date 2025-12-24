import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DocumentItem } from 'src/app/features/user/services/user.service';
import { SHARED_IMPORTS } from 'src/app/shared';


@Component({
  selector: 'notary-recent-activity',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class NotaryRecentActivityComponent {
  @Input() documents: DocumentItem[] = [];
  @Output() viewAllClick = new EventEmitter<void>();

  onViewAll(): void {
    this.viewAllClick.emit();
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'check_circle';
      case 'pending':
        return 'schedule';
      case 'draft':
        return 'edit';
      default:
        return 'description';
    }
  }
}
