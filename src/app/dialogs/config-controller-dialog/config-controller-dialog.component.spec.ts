import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigControllerDialogComponent } from './config-controller-dialog.component';

describe('ConfigControllerDialogComponent', () => {
  let component: ConfigControllerDialogComponent;
  let fixture: ComponentFixture<ConfigControllerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigControllerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigControllerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
