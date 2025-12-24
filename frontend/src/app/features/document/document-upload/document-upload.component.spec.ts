import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { DocumentUploadComponent } from './document-upload.component';

describe('DocumentUploadComponent', () => {
  let component: DocumentUploadComponent;
  let fixture: ComponentFixture<DocumentUploadComponent>;
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
      imports: [DocumentUploadComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty uploaded files', () => {
    expect(component.uploadedFiles.length).toBe(0);
  });

  it('should add valid files when onFileSelected is called', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockEvent = {
      target: {
        files: [mockFile],
        value: ''
      }
    };
    
    component.onFileSelected(mockEvent);
    expect(component.uploadedFiles.length).toBe(1);
    expect(component.uploadedFiles[0]).toBe(mockFile);
  });

  it('should remove file when removeFile is called', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.uploadedFiles.push(mockFile);
    
    component.removeFile(0);
    expect(component.uploadedFiles.length).toBe(0);
  });

  it('should return false for isFormValid when no files are uploaded', () => {
    expect(component.isFormValid()).toBe(false);
  });

  it('should return true for isFormValid when files are uploaded', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.uploadedFiles.push(mockFile);
    expect(component.isFormValid()).toBe(true);
  });
});

