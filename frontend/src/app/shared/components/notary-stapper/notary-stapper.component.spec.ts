import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaryStapperComponent } from './notary-stapper.component';

describe('NotaryStapperComponent', () => {
  let component: NotaryStapperComponent;
  let fixture: ComponentFixture<NotaryStapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotaryStapperComponent]
    });
    fixture = TestBed.createComponent(NotaryStapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
