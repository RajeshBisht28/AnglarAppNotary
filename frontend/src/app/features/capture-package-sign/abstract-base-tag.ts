import { Component, ElementRef, HostBinding, inject} from '@angular/core';

import { FieldInfo } from 'src/app/models/signer.model';
import { CaptureSignService } from './capture-sign.service';
import { NotificationService } from 'src/app/core';

@Component({
  template: '',
})
export abstract class BaseTagComponent {

  envelopeId?: string | null;

  accountId?: string | null;

  @HostBinding('style.left') left?: string;

  @HostBinding('style.top') top?: string;

  public field!: FieldInfo;

  highlight!: boolean;

  private notificationService = inject(NotificationService);

  constructor(
    private elRef: ElementRef,
    protected signerService: CaptureSignService
  ) {
    this.listenToValueChange();
  }

  focus = () => {
    this.elRef.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  public checkSessionJoined(): boolean {
    if (!this.signerService.isSessionJoined()) {
      this.notificationService.showError('Please join the session before signing');
      return false;
    }
    return true;
  }

  onChange = ($event: any) => {
    if (!this.checkSessionJoined()) {
      return;
    }
    this.signerService.setValue(this.field.standardTagId.toString(), $event.target.value);
  };

  setDataChange(value: string) {
    if (!this.checkSessionJoined()) {
      return;
    }
    this.signerService.setValue(this.field.standardTagId.toString(), value);
  }

  formatDate(event: string) {
    if (!this.checkSessionJoined()) {
      return;
    }

    if (!event) {
      this.field.value = '';
      return;
    }
    const [y, m, d] = event.split('-');
    this.field.value = `${m}/${d}/${y}`;
    this.signerService.setValue(this.field.standardTagId.toString(), `${m}/${d}/${y}`);
  }

  listenToValueChange = () => {
    this.signerService.fieldValueChange.subscribe((data) => {
      if (this.field.standardTagId.toString() === data.key) {
        this.field.value = data.value;
      }
    });
  };
}
