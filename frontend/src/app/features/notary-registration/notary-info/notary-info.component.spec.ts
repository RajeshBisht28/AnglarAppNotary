import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaryInfoComponent } from './notary-info.component';

describe('NotaryInfoComponent', () => {
  let component: NotaryInfoComponent;
  let fixture: ComponentFixture<NotaryInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotaryInfoComponent]
    });
    fixture = TestBed.createComponent(NotaryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
