import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { StreamManager, Session, OpenVidu } from 'openvidu-browser';
import { SHARED_IMPORTS } from 'src/app/shared';
import { VideoControlComponent } from '../video-control/video-control.component';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, VideoControlComponent],
  selector: 'notary-user-video',
  templateUrl: './user-video.component.html',
  styleUrls: ['./user-video.component.scss']
})
export class UserVideoComponent implements AfterViewInit, OnChanges {
  @Input() streamManager: StreamManager | undefined;
  @Input() session: Session | undefined;
  @Input() OV: OpenVidu | undefined;

  @Input() displayName: string = '';

  @ViewChild('videoElement') videoElement!: ElementRef;

  ngAfterViewInit() {
    this.updateVideoElement();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['streamManager']) {
      this.updateVideoElement();
    }
  }

  private updateVideoElement(): void {
    if (this.streamManager && this.videoElement) {
      this.streamManager.addVideoElement(this.videoElement.nativeElement);
    }
  }
}
