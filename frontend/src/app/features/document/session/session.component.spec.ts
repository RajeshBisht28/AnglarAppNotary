import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { SessionComponent } from './session.component';

describe('SessionComponent', () => {
  let component: SessionComponent;
  let fixture: ComponentFixture<SessionComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [SessionComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.scheduleForm.valid).toBe(false);
  });

  it('should return false for isFormValid when form is invalid', () => {
    expect(component.isFormValid()).toBe(false);
  });

  it('should return true for isFormValid when form is valid', () => {
    component.scheduleForm.patchValue({
      date: '2024-12-25',
      timeSlot: '9:00 AM - 10:00 AM'
    });
    expect(component.isFormValid()).toBe(true);
  });

  it('should have available time slots', () => {
    expect(component.availableTimeSlots.length).toBeGreaterThan(0);
  });
});

