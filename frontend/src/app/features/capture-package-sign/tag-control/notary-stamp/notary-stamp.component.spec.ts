import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaryStampComponent } from './notary-stamp.component';

describe('NotaryStampComponent', () => {
  let component: NotaryStampComponent;
  let fixture: ComponentFixture<NotaryStampComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotaryStampComponent]
    });
    fixture = TestBed.createComponent(NotaryStampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
