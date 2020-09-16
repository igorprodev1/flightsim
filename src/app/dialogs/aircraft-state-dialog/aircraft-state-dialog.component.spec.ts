import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftStateDialogComponent } from './aircraft-state-dialog.component';

describe('AircraftStateDialogComponent', () => {
  let component: AircraftStateDialogComponent;
  let fixture: ComponentFixture<AircraftStateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AircraftStateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AircraftStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
