import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaryRegistrationComponent } from './notary-registration.component';

describe('NotaryRegistrationComponent', () => {
  let component: NotaryRegistrationComponent;
  let fixture: ComponentFixture<NotaryRegistrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotaryRegistrationComponent]
    });
    fixture = TestBed.createComponent(NotaryRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
