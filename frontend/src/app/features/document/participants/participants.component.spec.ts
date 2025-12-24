import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ParticipantsComponent } from './participants.component';

describe('ParticipantsComponent', () => {
  let component: ParticipantsComponent;
  let fixture: ComponentFixture<ParticipantsComponent>;
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
      imports: [ParticipantsComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one participant', () => {
    expect(component.participants.length).toBe(1);
  });

  it('should add participant when addParticipant is called', () => {
    const initialLength = component.participants.length;
    component.addParticipant();
    expect(component.participants.length).toBe(initialLength + 1);
  });

  it('should not remove participant if only one exists', () => {
    component.removeParticipant(0);
    expect(component.participants.length).toBe(1);
  });

  it('should remove participant when multiple exist', () => {
    component.addParticipant();
    const initialLength = component.participants.length;
    component.removeParticipant(0);
    expect(component.participants.length).toBe(initialLength - 1);
  });
});

