import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DocumentItem } from '../../services/user.service';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent {
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
