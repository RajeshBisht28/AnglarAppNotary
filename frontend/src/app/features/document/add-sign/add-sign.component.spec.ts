import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSignComponent } from './add-sign.component';

describe('AddSignComponent', () => {
  let component: AddSignComponent;
  let fixture: ComponentFixture<AddSignComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddSignComponent]
    });
    fixture = TestBed.createComponent(AddSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
