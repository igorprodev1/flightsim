import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightsimComponent } from './flightsim.component';

describe('FlightsimComponent', () => {
  let component: FlightsimComponent;
  let fixture: ComponentFixture<FlightsimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightsimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightsimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
