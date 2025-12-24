import { Component, Input } from '@angular/core';
import { StreamManager, Publisher, Session, OpenVidu } from 'openvidu-browser';
import { SHARED_IMPORTS } from 'src/app/shared';
import { NotificationService } from 'src/app/core';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'notary-video-control',
  templateUrl: './video-control.component.html',
  styleUrls: ['./video-control.component.scss']
})
export class VideoControlComponent {
  @Input() streamManager: StreamManager | undefined;
  @Input() session: Session | undefined;
  @Input() OV: OpenVidu | undefined;

  screenSharing: boolean = false;
  screenSharingPublisher: Publisher | undefined;

  audioEnabled: boolean = true;
  videoEnabled: boolean = true;

  constructor(private notificationService: NotificationService) {}

  toggleAudio() {
    if (this.streamManager instanceof Publisher) {
      try {
        this.audioEnabled = !this.audioEnabled;
        this.streamManager.publishAudio(this.audioEnabled);
        const status = this.audioEnabled ? 'enabled' : 'disabled';
        this.notificationService.showSuccess(`Microphone ${status}`);
      } catch (error: any) {
        this.audioEnabled = !this.audioEnabled;
        this.notificationService.showError(`Failed to toggle microphone: ${error.message}`);
      }
    }
  }

  toggleVideo() {
    if (this.streamManager instanceof Publisher) {
      try {
        this.videoEnabled = !this.videoEnabled;
        this.streamManager.publishVideo(this.videoEnabled);
        const status = this.videoEnabled ? 'enabled' : 'disabled';
        this.notificationService.showSuccess(`Camera ${status}`);
      } catch (error: any) {
        this.videoEnabled = !this.videoEnabled;
        this.notificationService.showError(`Failed to toggle camera: ${error.message}`);
      }
    }
  }

  toggleScreenShare() {
    if (!(this.streamManager instanceof Publisher) || !this.session || !this.OV) return;

    if (this.screenSharing) {
      try {
        this.session.unpublish(this.screenSharingPublisher!);
        this.session.publish(this.streamManager as Publisher);
        this.screenSharing = false;
        this.notificationService.showSuccess('Screen sharing stopped');
      } catch (error: any) {
        this.notificationService.showError(`Failed to stop screen sharing: ${error.message}`);
      }
    } else {
      try {
        this.screenSharingPublisher = this.OV.initPublisher(undefined, {
          videoSource: 'screen',
          publishAudio: false,
          mirror: false
        });

        this.screenSharingPublisher.once('accessAllowed', () => {
          try {
            this.session!.unpublish(this.streamManager as Publisher);
            this.session!.publish(this.screenSharingPublisher!);
            this.screenSharing = true;
            this.notificationService.showSuccess('Screen sharing started');
          } catch (error: any) {
            this.notificationService.showError(`Failed to publish screen: ${error.message}`);
          }
        });

        this.screenSharingPublisher.once('accessDenied', () => {
          this.notificationService.showError('Screen sharing permission denied');
        });
      } catch (error: any) {
        this.notificationService.showError(`Failed to start screen sharing: ${error.message}`);
      }
    }
  }
}
