import { Component, OnInit, OnDestroy } from '@angular/core';
import { SHARED_IMPORTS } from 'src/app/shared';
import { ScheduleOptionsComponent, ScheduleChoice } from './schedule-options/schedule-options.component';
import { ScheduleLaterRequest } from './schedule-later-form/schedule-later-form.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { VideoConferenceComponent } from '../../notarization/video-conference/video-conference.component';
import { ActivatedRoute, Router } from '@angular/router';
import { StepService } from '../service';
import { Subscription } from 'rxjs';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { AuthService } from 'src/app/core';
import { CalendlyIframeComponent } from '../../calendly/calendly-iframe/calendly-iframe.component';
import { NotarySelectorComponent } from './notary-selector/notary-selector.component';
import { Notary, SessionType } from 'src/app/models/notary.model';


@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, ScheduleOptionsComponent,
    VideoConferenceComponent, CalendlyIframeComponent, NotarySelectorComponent
  ],
  selector: 'session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit, OnDestroy {
  mode: 'select' | 'later' | 'instant' = 'select';
  packageId!: string | null | undefined;
  private sub = new Subscription();
  signerId: any;
  user: any;
  selectedNotary: Notary | null = null;
  sessionType: SessionType | null = null;
  notarySaved = false;

  constructor(private notify: NotificationService,
    private route: ActivatedRoute,
    private stepService: StepService,
    private router: Router,
    private notaryUserApi: NotaryUserAPIService,
    private loadingService: LoadingService,
    private authUser: AuthService
  ) { 
    this.user = this.authUser.getUser();
  }

  ngOnInit(): void {
    this.packageId = this.route.parent?.snapshot.paramMap.get('id');
    this.signerId = this.route.snapshot.paramMap.get('signerId');
    this.sub.add(this.stepService.next$.subscribe(() => this.onNext()));
    this.sub.add(this.stepService.prev$.subscribe(() => this.onPrevious()));
    
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onChoose(choice: ScheduleChoice) {
    this.mode = choice === 'later' ? 'later' : 'instant';
    this.sessionType = choice === 'later' ? 'Scheduled' : 'Instant';
    this.selectedNotary = null;
    this.notarySaved = false;
  }

  onNotarySaved(notary: Notary) {
    this.selectedNotary = notary;
    this.notarySaved = true;
    if (this.mode === 'instant') {
      this.informAllParticipentsByEmail();
    }
  }

  onSubmitLater(payload: ScheduleLaterRequest) {
    if (!this.packageId) {
      this.notify.showError('Package ID is missing');
      return;
    }

    this.loadingService.show();
    this.notaryUserApi.scheduleSession(this.packageId, payload.date, payload.time)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.notify.showSuccess('Session scheduled successfully');
          this.scheduledLater();
        },
        error: (err) => {
          this.loadingService.hide();
          console.error('Schedule session error:', err);
          this.notify.showError('Failed to schedule session. Please try again.');
        }
      });
  }

  scheduledLater() {
    console.log(this.user);
    if(this.user.userType === 'Notary'){
      this.router.navigate(['/notary-user/dashboard']);
    }else{
      this.router.navigate(['/user/dashboard']);
    }
  }

  onStartInstant() {
    this.notify.showSuccess('Starting session now');
  }

  informAllParticipentsByEmail() {
    if (this.packageId) {
      this.notaryUserApi.sendEmailSession(this.packageId)
        .subscribe({
          error: (err) => {
            console.error('Send email error:', err);
          }
        });
    }
  }

  onPrevious(): void {
    if (this.packageId) {
      if (this.user.userType === 'Notary' || this.user.role === 'Notary') {
        this.router.navigate(['/document/package', this.packageId, 'sign']);
      } else {
        this.router.navigate(['/document/package', this.packageId, 'id-verification']);
      }
    }
  }

  onNext(): void {
    if (this.packageId) {
      if (this.user.userType === 'Notary' && this.mode === 'later') {
        this.router.navigate(['/notary-user/dashboard']);
      } else if (this.user.userType === 'User' && this.mode === 'later') {
        this.router.navigate(['/user/dashboard']);
      } else {
        this.router.navigate(['/document/package', this.packageId, 'payment']);
      }
    }
  }
}
