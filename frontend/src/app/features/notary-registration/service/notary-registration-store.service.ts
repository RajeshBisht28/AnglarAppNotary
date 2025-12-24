import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class NotaryRegistrationStoreService {

  private notaryIdSource = new BehaviorSubject<string | null>(null);
  notaryId$ = this.notaryIdSource.asObservable();

  setNotaryId(id: string) {
    this.notaryIdSource.next(id);
  }

  getNotaryId() {
    return this.notaryIdSource.getValue();
  }
}