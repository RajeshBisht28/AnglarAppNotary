import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaptureSignService {
  public userSignature: any;

  public userInitial: any;

  public fieldValueChange: EventEmitter<{ key: string; value: any }>;

  public finishDocEvent: EventEmitter<any> = new EventEmitter<any>();

  public docSyncEvent: EventEmitter<any> = new EventEmitter<any>();

  public finishApiResponseEvent: EventEmitter<any> = new EventEmitter<any>();

  public sessionJoinedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  private sessionJoined: boolean = false;

  constructor() {
    this.fieldValueChange = new EventEmitter<{ key: string; value: any }>();
  }

  public setUserSignature(signature: any) {
    this.userSignature = signature;
  }

  public setUserInitial(intial: any) {
    this.userInitial = intial;
  }

  public setValue(key: string, value: any) {
    this.fieldValueChange.emit({ key, value });
  }

  public setSessionJoined(joined: boolean) {
    this.sessionJoined = joined;
    this.sessionJoinedEvent.emit(joined);
  }

  public isSessionJoined(): boolean {
    return this.sessionJoined;
  }
}
