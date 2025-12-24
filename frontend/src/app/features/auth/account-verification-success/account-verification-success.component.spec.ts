import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountVerificationSuccessComponent } from './account-verification-success.component';

describe('AccountVerificationSuccessComponent', () => {
  let component: AccountVerificationSuccessComponent;
  let fixture: ComponentFixture<AccountVerificationSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AccountVerificationSuccessComponent]
    });
    fixture = TestBed.createComponent(AccountVerificationSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
