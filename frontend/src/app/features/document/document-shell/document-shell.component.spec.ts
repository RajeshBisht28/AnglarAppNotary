import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { of } from 'rxjs';

import { DocumentShellComponent } from './document-shell.component';

describe('DocumentShellComponent', () => {
  let component: DocumentShellComponent;
  let fixture: ComponentFixture<DocumentShellComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(new NavigationEnd(1, '/test', '/test')),
      url: '/test'
    });

    await TestBed.configureTestingModule({
      imports: [DocumentShellComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update current step based on URL', () => {
    component.updateCurrentStep('/package/1/participants');
    expect(component.currentStep).toBe(1);
    
    component.updateCurrentStep('/package/1/document');
    expect(component.currentStep).toBe(2);
    
    component.updateCurrentStep('/package/1/session');
    expect(component.currentStep).toBe(3);
    
    component.updateCurrentStep('/package/1/payment');
    expect(component.currentStep).toBe(4);
  });
});
