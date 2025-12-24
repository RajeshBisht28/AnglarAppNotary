import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendlyIframeComponent } from './calendly-iframe.component';

describe('CalendlyIframeComponent', () => {
  let component: CalendlyIframeComponent;
  let fixture: ComponentFixture<CalendlyIframeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendlyIframeComponent]
    });
    fixture = TestBed.createComponent(CalendlyIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
