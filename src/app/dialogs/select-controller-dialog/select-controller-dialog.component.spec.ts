import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectControllerDialogComponent } from './select-controller-dialog.component';

describe('SelectControllerDialogComponent', () => {
  let component: SelectControllerDialogComponent;
  let fixture: ComponentFixture<SelectControllerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectControllerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectControllerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
