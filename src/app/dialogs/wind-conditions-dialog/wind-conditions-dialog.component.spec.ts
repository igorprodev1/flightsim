import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindConditionsDialogComponent } from './wind-conditions-dialog.component';

describe('WindConditionsDialogComponent', () => {
  let component: WindConditionsDialogComponent;
  let fixture: ComponentFixture<WindConditionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindConditionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindConditionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
