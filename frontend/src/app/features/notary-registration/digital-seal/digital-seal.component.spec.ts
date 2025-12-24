import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalSealComponent } from './digital-seal.component';

describe('DigitalSealComponent', () => {
  let component: DigitalSealComponent;
  let fixture: ComponentFixture<DigitalSealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DigitalSealComponent]
    });
    fixture = TestBed.createComponent(DigitalSealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
