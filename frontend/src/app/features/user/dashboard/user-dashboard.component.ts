import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from 'src/app/shared';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService, DocumentItem } from '../services/user.service';
import { map, Subscription } from 'rxjs';
import { DynamicDialogService } from 'src/app/shared/components/dynamic-dialog/dynamic-dialog.service';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { StatsGridComponent } from './stats-grid/stats-grid.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';
import { ProfileSummaryComponent, ProfileData } from './profile-summary/profile-summary.component';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { StatCard } from 'src/app/models/dashboard.models';
import { MatDialog } from '@angular/material/dialog';
import { EmailAssignDialogComponent } from 'src/app/shared/components/email-assign-dialog/email-assign-dialog.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ...SHARED_IMPORTS,
    DashboardHeaderComponent,
    StatsGridComponent,
    RecentActivityComponent,
    ProfileSummaryComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  firstName = 'User';
  documents: DocumentItem[] = [];
  statsArray: StatCard[] = [
    {
      label: 'All Documents',
      value: 0,
      icon: 'description',
      type: 'primary'
    },
    {
      label: 'Pending',
      value: 0,
      icon: 'schedule',
      type: 'warning'
    },
    {
      label: 'Completed',
      value: 0,
      icon: 'task_alt',
      type: 'success'
    },
    {
      label: 'Draft',
      value: 0,
      icon: 'edit',
      type: 'info'
    }
  ];

  profileData: ProfileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    memberSince: 'January 2024',
    documentsCount: 0,
    completedNotarizations: 0
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private dynamicDialog: DynamicDialogService,
    private packageService: PackageApiService,
    private apiService: NotaryUserAPIService,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDocuments();
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUserData(): void {
    const user = this.authService.getUser();
    if (user && user.firstName) {
      this.firstName = user.firstName;
      this.profileData = {
        name: user.firstName && user.LastName 
          ? `${user.firstName} ${user.LastName}` 
          : user.userName || 'User',
        email: user.loginId || 'No email provided',
        phone: '+1 (555) 123-4567',
        memberSince: 'Recently',
        documentsCount: 0,
        completedNotarizations: 0
      };
    }
  }

  private loadDocuments(): void {
    const documentsSub = this.userService.getDocuments().subscribe(documents => {
      this.documents = documents;
    });
    this.subscriptions.push(documentsSub);
  }

  private loadDashboardStats(): void {
    const dashboardStatsSub = this.apiService.getDashboardStats()
      .subscribe(stats => {
        if (stats) {
          this.statsArray[0].value = stats.totalCount;
          this.statsArray[1].value = stats.pendingCount;
          this.statsArray[2].value = stats.completedCount;
          this.statsArray[3].value = stats.draftCount;

          this.profileData.documentsCount = stats.totalCount;
          this.profileData.completedNotarizations = stats.completedCount;
        }
      });
    this.subscriptions.push(dashboardStatsSub);
  }

  onNotarizeNow(): void {
    const isNotaryUser = this.authService.getUser()?.userType === 'Notary' || this.authService.getUser()?.role === 'Notary';
    const fields: any[] = [
      { name: 'name', label: 'Package Name', type: 'text', required: true, validators: ['minLength', 'pattern'], minLength: 2, pattern: '^[A-Za-z0-9._@~ ]+$' },
      { name: 'description', label: 'Description', type: 'text' },
    ];

    if (isNotaryUser) {
      fields.push({
        name: 'assignToUser',
        label: 'Assign to User',
        type: 'checkbox',
        required: false
      });
    }

    this.dynamicDialog.open(
      {
        title: 'Create Package',
        message: 'Create a package by uploading the documents you want to notarize and adding signer details.',
        fields,
        initialValues: { role: 'user', assignToUser: false },
        buttons: [
          { text: 'Cancel', type: 'close' },
          { text: 'Save', type: 'submit', color: 'primary', disabledWhenInvalid: true }
        ],
        onSubmit: (payload: any) => {
          return this.packageService.packageCreate(payload).pipe(
            map((data: any) => ({
              ...data,
              assignToUser: payload.assignToUser || false
            }))
          );
        },
        autoCloseOnSuccess: true
      },
      {
        panelClass: 'create-package-dialog'
      }
    ).subscribe((result: any) => {
      if (result) {
        const packageUrl = window.location.origin + '/e-notary/document/package/' + result.id + '/document';
        if (result.assignToUser) {
          this.openEmailAssignDialog(result.id, packageUrl);
        } else {
          this.router.navigate(['/document/package', result.id, 'document']);
        }
      }
    });
  }

  private openEmailAssignDialog(packageId: string, packageUrl: string): void {
    this.matDialog.open(EmailAssignDialogComponent, {
      width: '400px',
      autoFocus: false,
      disableClose: false,
      data: {
        packageId,
        packageUrl
      }
    });
  }

  onViewDocuments(): void {
    this.router.navigate(['/user/document-vault']);
  }

  onStatClick(index: number): void {
    if (index === 0) {
      this.onViewDocuments();
    }
  }
}
