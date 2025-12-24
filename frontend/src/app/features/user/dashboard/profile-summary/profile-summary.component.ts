import { Component, Input } from '@angular/core';
import { SHARED_IMPORTS } from 'src/app/shared';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  documentsCount: number;
  completedNotarizations: number;
}

@Component({
  selector: 'app-profile-summary',
  standalone: true,
  imports: [...SHARED_IMPORTS,],
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss']
})
export class ProfileSummaryComponent {
  @Input() profileData!: ProfileData;
}
