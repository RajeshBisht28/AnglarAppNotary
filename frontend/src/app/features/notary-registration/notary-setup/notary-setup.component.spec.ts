import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotarySetupComponent } from './notary-setup.component';

describe('NotarySetupComponent', () => {
  let component: NotarySetupComponent;
  let fixture: ComponentFixture<NotarySetupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotarySetupComponent]
    });
    fixture = TestBed.createComponent(NotarySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
