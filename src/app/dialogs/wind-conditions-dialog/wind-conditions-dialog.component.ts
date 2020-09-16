import { forkJoin, interval } from 'rxjs';
import { SimulationServerService} from './../../services/simulation-server.service';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { VariableDefinition } from 'src/app/models/variable-definition';

@Component({
  selector: 'app-wind-conditions-dialog',
  templateUrl: './wind-conditions-dialog.component.html',
  styleUrls: ['./wind-conditions-dialog.component.scss']
})
export class WindConditionsDialogComponent implements OnInit {
  variables: VariableDefinition[] = [
    {
      variableLabel: 'Mean Speed [m/s]',
      variableId: 'windMeanSpeed' ,
      systemType: 'Environment',
      systemId: 'default_environment',
      systemName: 'default_environment',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Average wind speed',
      precision: 1
    },
    {
      variableLabel: 'Gust Speed [m/s]',
      variableId: 'windGustSpeed' ,
      systemType: 'Environment',
      systemId: 'default_environment',
      systemName: 'default_environment',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Magnitude of wind speed variation around the average wind speed',
      precision: 1
    },
    {
      variableLabel: 'Turbulence [%]',
      variableId: 'turbulenceIntensity-percentage-' ,
      systemType: 'Environment',
      systemId: 'default_environment',
      systemName: 'default_environment',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Intensity of wind turbulence',
      precision: 1
    },
    {
      variableLabel: 'Direction [deg]',
      variableId: 'windAzimuth' ,
      systemType: 'Environment',
      systemId: 'default_environment',
      systemName: 'default_environment',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Wind direction (0 is north, 90 is east)',
      precision: 1
    },
    {
      variableLabel: 'Inclination [deg]',
      variableId: 'windInclination' ,
      systemType: 'Environment',
      systemId: 'default_environment',
      systemName: 'default_environment',
      componentType: 'system',
      index: 0,
      showRangeHint: false,
      step: 0.1,
      tooltip: 'Wind inclination relative to ground (0 is horizontal, 90 is vertical)',
      precision: 1
    }
  ];

  constructor(
    private simulationServ: SimulationServerService,
    private dialogRef: MatDialogRef<WindConditionsDialogComponent>
  ) {
  }

  ngOnInit() {
  }
}
