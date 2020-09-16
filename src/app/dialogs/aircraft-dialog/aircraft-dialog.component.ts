import { UserService } from './../../services/user.service';
import { SimulationServerService } from './../../services/simulation-server.service';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FirebaseAircraft } from '../../models/aircraft';
import { GuideDialogComponent } from './../../dialogs/guide-dialog/guide-dialog.component';
import { Simget } from './../../models/simget';

@Component({
  selector: 'app-aircraft-dialog',
  templateUrl: './aircraft-dialog.component.html',
  styleUrls: ['./aircraft-dialog.component.scss']
})
export class AircraftDialogComponent {
  aircrafts;
  selectedAirc;
  private guideDlg;
  constructor(
    private userServ: UserService,
    private dialog: MatDialog,
    private simulationServ: SimulationServerService,
  ) {
    this.userServ.getUserContent('aircraft').then( ac => {
      this.aircrafts = ac;
      if (this.userServ.defaultAircraftSubj.value === null || this.userServ.defaultAircraftSubj.value.name === null) {
        this.selectedAirc = this.aircrafts[0];
      } else {
        this.selectedAirc = this.aircrafts.filter( (a: FirebaseAircraft) => a.name === this.userServ.defaultAircraftSubj.value.name)[0];
      }
    });
  }

  async fly() {
    this.userServ.setDefaultSetting('aircraft', this.selectedAirc.name);
    this.simulationServ.get('Aircraft', 'system', 0, 'guide').subscribe((guideText: Simget) => {
        if (guideText.value && guideText.value.length > 5){
          this.guideDlg = this.dialog.open(GuideDialogComponent, {
            hasBackdrop: false,
            width: '60vw'
          });
          this.guideDlg.componentInstance.guideText = guideText.value;
        }
      }
    );
  }

}
