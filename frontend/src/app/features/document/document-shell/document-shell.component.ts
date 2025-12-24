import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotaryStapperComponent, SHARED_IMPORTS } from 'src/app/shared';
import { DocumentHeaderComponent } from 'src/app/shared/components/document-header/document-header.component';
import { DocumentFooterComponent } from 'src/app/shared/components/document-footer/document-footer.component';
import { StepService } from '../service';
import { AuthService } from 'src/app/core';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, NotaryStapperComponent, RouterOutlet, DocumentHeaderComponent, DocumentFooterComponent],
  selector: 'document-shell',
  templateUrl: './document-shell.component.html',
  styleUrls: ['./document-shell.component.scss']
})
export class DocumentShellComponent implements OnInit {
  currentStep = 1;
  isSignRoute = false;
  isNotaryUser = false;

  allSteps = [
    { label: 'Upload Documents', icon: 'cloud_upload' },
    { label: 'Participants', icon: 'group' },
    { label: 'Document Preparation', icon: 'gesture' },
    { label: 'ID Verification', icon: 'verified_user' },
    { label: 'Schedule Session', icon: 'calendar_today' },
    { label: 'Payment', icon: 'payment' }
  ];

  steps: { label: string; icon: string }[] = [];

  constructor(private router: Router, private authService: AuthService) {
    this.initializeSteps();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateCurrentStep(event.url);
      });

    this.updateCurrentStep(this.router.url);
  }

  private initializeSteps(): void {
    const user = this.authService.getUser();
    this.isNotaryUser = user?.userType === 'Notary' || user?.role === 'Notary';

    if (this.isNotaryUser) {
      this.steps = this.allSteps.filter(
        (step) => step.label !== 'ID Verification' && step.label !== 'Payment'
      );
    } else {
      this.steps = this.allSteps;
    }
  }

  updateCurrentStep(url: string): void {
    this.isSignRoute = url.includes('/sign');

    if (this.isNotaryUser) {
      if (url.includes('/participants')) {
        this.currentStep = 2;
      } else if (url.includes('/sign')) {
        this.currentStep = 3;
      } else if (url.includes('/session')) {
        this.currentStep = 4;
      } else if (url.includes('/document')) {
        this.currentStep = 1;
      }
    } else {
      if (url.includes('/participants')) {
        this.currentStep = 2;
      } else if (url.includes('/sign')) {
        this.currentStep = 3;
      } else if (url.includes('/id-verification')) {
        this.currentStep = 4;
      } else if (url.includes('/session')) {
        this.currentStep = 5;
      } else if (url.includes('/payment')) {
        this.currentStep = 6;
      } else if (url.includes('/document')) {
        this.currentStep = 1;
      }
    }
  }

}
