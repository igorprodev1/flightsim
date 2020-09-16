import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelLocationDialogComponent } from './sel-location-dialog.component';

describe('SelLocationDialogComponent', () => {
  let component: SelLocationDialogComponent;
  let fixture: ComponentFixture<SelLocationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelLocationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
