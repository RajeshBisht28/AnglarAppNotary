import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/auth.models';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { AccountCardComponent } from '../account-card/account-card.component';
import { BusinessCardComponent } from '../business-card/business-card.component';
import { ActionCardsComponent } from '../action-cards/action-cards.component';
import { DynamicDialogService } from 'src/app/shared/components/dynamic-dialog/dynamic-dialog.service';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EmailAssignDialogComponent } from 'src/app/shared/components/email-assign-dialog/email-assign-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardHeaderComponent,
    AccountCardComponent,
    BusinessCardComponent,
    ActionCardsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dynamicDialog: DynamicDialogService,
    private packageService: PackageApiService,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getUser();
  }

  getUserFullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.LastName}`;
    }
    return 'User';
  }

  getUserFirstName(): string {
    if (this.currentUser) {
      return this.currentUser.firstName;
    }
    return 'User';
  }

  getUserInitials(): string {
    if (this.currentUser) {
      const firstName = this.currentUser.firstName || '';
      const lastName = this.currentUser.LastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  onActionClicked(actionType: string): void {
    if (actionType === 'notarize') {
      this.navigateToNotarization();
    } else if (actionType === 'esign') {
      this.navigateToESign();
    }
  }

 navigateToNotarization(): void {
  const isNotaryUser = this.authService.getUser()?.userType === 'Notary' || this.authService.getUser()?.role === 'Notary';
  const fields: any[] = [
    { name: 'name', label: 'Package Name', type: 'text', required: true, validators: ['minLength'], minLength: 2 },
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
      onSubmit: (payload) => {
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


  navigateToESign(): void {
  //  this.router.navigate(['/notarization']);
}

  navigateToAccountManagement(): void {
    this.router.navigate(['/dashboard/account']);
  }

  navigateToBusinessPro(): void {
    this.router.navigate(['/business']);
  }
}
