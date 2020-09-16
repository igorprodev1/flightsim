import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { VariableDefinition } from 'src/app/models/variable-definition';

@Component({
  selector: 'app-aircraft-state-dialog',
  templateUrl: './aircraft-state-dialog.component.html',
  styleUrls: ['./aircraft-state-dialog.component.scss']
})
export class AircraftStateDialogComponent implements OnInit {
  selectVars = new FormControl();

  variables: VariableDefinition[] = [
    {
      variableLabel: 'Distance from Home [m]',
      variableId: 'distanceFromHome'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Distance between aircraft and takeoff location',
      precision: 1
    },
    {
      variableLabel: 'Altitude Relative to Home [m]',
      variableId: 'altitudeFromHome'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Altitude relative to takeoff location',
      precision: 1
    },
    {
      variableLabel: 'Angle of Attack [deg]',
      variableId: 'angleOfAttack-deg-'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Aircraft angle of attack',
      precision: 1
    },
    {
      variableLabel: 'Speed [m/s]',
      variableId: 'speed-mps-'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Aircraft true speed',
      precision: 1
    },
    {
      variableLabel: 'Altitude MSL [m]',
      variableId: 'altitude-m-'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Aircraft altitude relative to mean sea level',
      precision: 1
    },
    {
      variableLabel: 'Pitch [deg]',
      variableId: 'pitch-deg-'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Aircraft pitch angle',
      precision: 1
    },
    {
      variableLabel: 'Roll [deg]',
      variableId: 'roll-deg-'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Aircraft roll angle',
      precision: 1
    },
    {
      variableLabel: 'Heading [deg]',
      variableId: 'heading_ENU-deg-'    ,
      systemType: 'Aircraft',
      systemId: 'default_aircraft',
      systemName: 'default_aircraft',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Aircraft heading (0 is north, 90 is east)',
      precision: 1
    },
    // {//TEST
    //   variableLabel: 'Out 1',
    //   variableId: 'state_1'    ,
    //   systemType: 'Aircraft',
    //   systemId: 'default_aircraft',
    //   systemName: 'default_aircraft',
    //   componentType: 'flightcontroller',
    //   index: 0,
    //   showRangeHint: false,
    //   step: 0.1,
    //   tooltip: 'Tooltip',
    //   precision: 1
    // },
    // {//TEST
    //   variableLabel: 'Out 2',
    //   variableId: 'state_2'    ,
    //   systemType: 'Aircraft',
    //   systemId: 'default_aircraft',
    //   systemName: 'default_aircraft',
    //   componentType: 'flightcontroller',
    //   index: 0,
    //   showRangeHint: false,
    //   step: 0.1,
    //   tooltip: 'Tooltip',
    //   precision: 1
    // }
  ];

  selected;
  constructor() { }

  ngOnInit() {
    try {      
      const json = localStorage.getItem('selectedVars');
      const vars = JSON.parse(json);
      this.selectVars.setValue(vars);
      this.selected = vars.map(id => this.variables.find(e => e.variableId === id));
    } catch (err)  {
      console.error(err);
      this.selected = null;
    }


    this.selectVars.valueChanges.subscribe(
      vars => {
        console.log(vars);
        this.selected = vars.map(id => this.variables.find(e => e.variableId === id));
        localStorage.setItem('selectedVars', JSON.stringify(vars));
      }
    )
  }

  // compareWith(o1: any, o2: any)  {
  //   return o1 && o2 ? o1.id === o2.id : o1 === o2;
  // }

  // onSelectVariables(event) {
  //   console.log(event);
  // }
}
