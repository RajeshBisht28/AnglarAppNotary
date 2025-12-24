import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { OpenVidu, Session, Publisher, StreamEvent, Subscriber } from 'openvidu-browser';
import type { ConnectionEvent } from 'openvidu-browser';
import { OpenViduService } from '../service/open-vidu.service';
import { AuditCaptureService, LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { UserVideoComponent } from '../user-video/user-video.component';
import { CaptureLiveSignComponent } from '../../capture-package-sign/capture-live-sign/capture-live-sign.component';
import { CaptureSignService } from '../../capture-package-sign/capture-sign.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotaryUserAPIService } from 'src/app/core/services/business/notary-user-api.service';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { Subscription } from 'rxjs';
import { AuthService, NotificationService } from 'src/app/core';
import { AuditCapture, SessionType } from 'src/app/models/audit-capture.enum';
import { DynamicDialogService } from 'src/app/shared/components/dynamic-dialog/dynamic-dialog.service';
import { User } from 'src/app/models/auth.models';
import { MediaDeviceValidationService } from '../service/media-device-validation.service';
import { UnverifiedIdBadgeComponent } from '../unverified-id-badge/unverified-id-badge.component';
import { MatDialog } from '@angular/material/dialog';
import { IdentityCaptureComponent } from '../../identity-capture/identity-capture.component';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent, UserVideoComponent, CaptureLiveSignComponent, UnverifiedIdBadgeComponent],
  selector: 'notary-video-conference',
  templateUrl: './video-conference.component.html',
  styleUrls: ['./video-conference.component.scss']
})
export class VideoConferenceComponent implements OnInit, OnDestroy {
  OV: OpenVidu | undefined;
  session: Session | undefined;
  publisher: Publisher | undefined;
  subscribers: Subscriber[] = [];
  sessionConnected = false;
  session_id!: string | null;
  apiResponseSubscription!: Subscription;

  userDetail: any;
  isIdVerified = true;
  isNotaryUser = false;

  @Input() packageId!: string;
  @Input() signerId!: string;

  constructor(
    private openViduService: OpenViduService,
    private captureSignService: CaptureSignService,
    private route: ActivatedRoute,
    private notaryUserApi: NotaryUserAPIService,
    private packageApi: PackageApiService,
    private authUser: AuthService,
    private auditCaptureService: AuditCaptureService,
    private dialog: DynamicDialogService,
    private notificationService: NotificationService,
    private router: Router,
    private mediaDeviceValidationService: MediaDeviceValidationService,
    private matDialog: MatDialog,
  ) {
    this.userDetail = this.authUser.getUser()!;
    this.isNotaryUser = this.userDetail?.userType === 'Notary' || this.userDetail?.role === 'Notary';
  }

  ngOnInit(): void {
    if (!this.packageId) {
      this.packageId = this.route.snapshot.paramMap.get('id')!;
      this.signerId = this.route.snapshot.paramMap.get('signerId')!;
    }
    this.createSessionId();
    this.sendFinishSignal();
  }

  createSessionId() {
    this.notaryUserApi.createSession(this.packageId)
      .subscribe(response => {
        this.session_id = response.sessionId;
        this.isIdVerified = response.isIdVerified !== 'N';
      });
  }

  sendFinishSignal() {
    this.apiResponseSubscription = this.captureSignService.finishApiResponseEvent
      .subscribe(() => {
        if (this.session) {
          const payload = {
            packageId: this.packageId,
            signerId: this.signerId,
            action: 'SIGNED',
            timestamp: new Date().toISOString()
          };
          this.session.signal({
            type: 'document-finished',
            data: JSON.stringify(payload)
          }).catch(err => console.error('Error sending signal:', err));
          if (this.userDetail.userType === 'Notary') {
            this.notificationService.showSuccess('Thank you! Your notary signing has been successfully completed');
            this.router.navigate(['/notary-user/dashboard']);
          }
        }
      });
  }

  /**
   *  Helper: Extract display name from Publisher/Subscriber
   * OpenVidu stores it in connection.data (often as JSON with clientData)
   */
  getStreamName(streamManager: Publisher | Subscriber | undefined): string {
    if (!streamManager?.stream?.connection?.data) return 'Unknown';

    const data = streamManager.stream.connection.data;

    try {
      const parsed = JSON.parse(data);
      return parsed.clientData || 'Unknown';
    } catch {
      return data || 'Unknown';
    }
  }

  async jumpToVideoRoom() {
    if (!this.session_id) return;

    const hasIdDocuments = await this.checkAndVerifyIdDocuments();
    if (!hasIdDocuments) {
      return;
    }

    this.proceedToVideoRoom();
  }

  private async proceedToVideoRoom(): Promise<void> {
    if (!this.session_id) return;

    const deviceValidation = await this.mediaDeviceValidationService.validateMediaDevices();

    if (!deviceValidation.isValid) {
      const errorMessages = deviceValidation.allErrors.join('\n\n');
      this.dialog.open({
        title: 'Media Device Error',
        message: errorMessages,
        fields: [],
        buttons: [
          { text: 'Close', type: 'close' }
        ]
      }).subscribe();

      return;
    }

    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    //  When someone publishes a stream
    this.session.on('streamCreated', (event: StreamEvent) => {
      const subscriber = this.session?.subscribe(event.stream, undefined);
      if (subscriber) this.subscribers.push(subscriber);

      if (this.subscribers.length === 1 && this.userDetail.userType === 'User') {
        this.auditCaptureService.sessionRecord(SessionType.START_SESSION, {
          packageId: this.packageId,
          sessionId: this.session_id!
        });
      }
    });

    //  When someone leaves
    this.session.on('connectionDestroyed', (event: ConnectionEvent) => {
      const leftConnId = event.connection.connectionId;

      this.subscribers = this.subscribers.filter(sub => {
        const subConnId = sub.stream.connection.connectionId;
        return subConnId !== leftConnId;
      });

      if (this.subscribers.length === 0 && this.userDetail.userType === 'User') {
        this.auditCaptureService.sessionRecord(SessionType.END_SESSION, {
          packageId: this.packageId,
          sessionId: this.session_id!
        });
      }
    });

    //  Custom signal
    this.session.on('signal:document-finished', (event: any) => {
      const payload = JSON.parse(event.data);
      this.captureSignService.docSyncEvent.emit(payload);
    });

    const token = await this.openViduService.getToken(this.session_id);
    if (token) {
      //  IMPORTANT: send userName here
      const clientData = this.userDetail?.userName || 'Unknown User';

      await this.session.connect(token, { clientData });
      this.sessionConnected = true;
      this.captureSignService.setSessionJoined(true);

      this.publisher = this.OV.initPublisher(undefined, {
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
      });

      this.session.publish(this.publisher);

      this.auditCaptureService.captureEvent({
        packageId: this.packageId,
        event: AuditCapture.SESSION_JOINED
      });
    }
  }

  leaveSession() {
    if (this.session) {
      this.session.disconnect();
      this.sessionConnected = false;
      this.captureSignService.setSessionJoined(false);
      this.publisher = undefined;
      this.subscribers = [];
      this.auditCaptureService.captureEvent({
        packageId: this.packageId,
        event: AuditCapture.SESSION_LEFT
      });
      if (this.userDetail.role === 'Witness' || this.userDetail.role === 'Signer') {
          this.notificationService.showSuccess('Thank you! Your signing has been successfully completed');
          this.router.navigate(['/auth/login']);
          return;
      }
      if (this.userDetail.userType === 'User') {
        this.router.navigate(['/document/package', this.packageId, 'payment']);
      }
    }
  }

  private checkAndVerifyIdDocuments(): Promise<boolean> {
    if (this.isNotaryUser) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      this.packageApi.getSignerIdDocuments(this.packageId, this.signerId).subscribe({
        next: (documents: any[]) => {
          if (documents && documents.length > 0) {
            resolve(true);
          } else {
            this.openIdentityCaptureDialog();
            resolve(false);
          }
        },
        error: (error) => {
          console.error('Error checking ID documents:', error);
          resolve(true);
        }
      });
    });
  }

  private openIdentityCaptureDialog(): void {
    const dialogRef = this.matDialog.open(IdentityCaptureComponent, {
      width: '90%',
      maxWidth: '600px',
      maxHeight: '600px',
      height: 'auto', 
      data: {
        packageId: this.packageId,
        userId: this.signerId
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.proceedToVideoRoom();
      }
    });
  }

  finishDocument = () => {
    this.captureSignService.finishDocEvent.emit();
  };

  joinSession() {
    this.dialog.open({
      title: 'Consent to Audio-video recording',
      message:
        'This remote online notarization session will be audio-video recorded. By continuing, you consent to the recording and storage of this session as required by law.',
      fields: [],
      buttons: [
        { text: 'Decline', type: 'close' },
        { text: 'Accept & Continue', type: 'custom', color: 'primary', actionKey: 'accept' }
      ],
      autoCloseOnSuccess: true,
      onAction: (actionKey: string) => {
        if (actionKey !== 'accept') return;
        this.jumpToVideoRoom();
        this.auditCaptureService.captureEvent({
          packageId: this.packageId,
          event: AuditCapture.VIDEO_SESSION_CONSENT_ACCEPTED
        });
        return true;
      }
    }).subscribe();
  }

  ngOnDestroy() {
    if (this.session) this.session.disconnect();
    this.captureSignService.setSessionJoined(false);
    if (this.apiResponseSubscription) this.apiResponseSubscription.unsubscribe();
  }
}
