import { WindConditionsDialogComponent } from './../../dialogs/wind-conditions-dialog/wind-conditions-dialog.component';
import { AircraftService } from './../../services/aircraft.service';
import { SimulationServerService } from './../../services/simulation-server.service';
import { ViewerService } from './../../services/viewer.service';
import { UserService } from './../../services/user.service';
import { User } from './../../models/user';
import { SelectControllerDialogComponent } from './../../dialogs/select-controller-dialog/select-controller-dialog.component';
import { AircraftDialogComponent } from './../../dialogs/aircraft-dialog/aircraft-dialog.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogPosition } from '@angular/material';
import { SelLocationDialogComponent } from 'src/app/dialogs/sel-location-dialog/sel-location-dialog.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AircraftStateDialogComponent } from 'src/app/dialogs/aircraft-state-dialog/aircraft-state-dialog.component';


@Component({
  selector: 'app-flightsim',
  templateUrl: './flightsim.component.html',
  styleUrls: ['./flightsim.component.scss']
})
export class FlightsimComponent implements OnInit {
  simulationState;
  viewMode;
  aircraftDlg;
  locationDlg;
  selControllerDlg;
  windCondDlg;
  aircraftStateDlg;
  initialized = false;


  constructor(
    private dialog: MatDialog,
    private simulationServ: SimulationServerService,
    private viewerServ: ViewerService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private acServ: AircraftService,
    private userServ: UserService
  ) {
    this.viewMode = 'GROUND';
  }

  ngOnInit() {
    this.userServ.userSubj.subscribe((user: User) => {
      if (user) {
        if ('cesiumAccessToken' in user) {
          Cesium.Ion.defaultAccessToken = user.cesiumAccessToken;
          Cesium.buildModuleUrl.setBaseUrl('/assets/cesium/');

          // this._initialize();
        }
        else {
          this.userServ.notifyUser('This account has not been intialized, please contact support.')
        }
      }
    });
  }

  _initialize() {
    if (!this.initialized) {
      this.viewerServ.createInstance('main', 'main-map');
      this.acServ.createInstance('main');
      this.viewerServ.instance('main').addAircraftInstance('main');
      this.simulationServ.simulationStateSubj.subscribe(
        state => this.simulationState = state
      );
      this.simulationServ.setSimulationState('SIMULATE');
      this.initialized = true;
    }
  }

  onSimState(event) {
    this.simulationServ.setSimulationState(event.value);
  }

  onViewMode(event) {
    this.viewerServ.instance('main').setViewMode(event.value);
  }

  openSelControllerDlg() {
    this.dialog.closeAll();
    if (this.selControllerDlg) {
      return;
    }
    this.selControllerDlg = this.dialog.open(SelectControllerDialogComponent, {
      hasBackdrop: false,
      width: '50vw'
    });
    this.selControllerDlg.afterClosed().subscribe(
      _ => this.selControllerDlg = null
    );
  }

  openAircraftDlg() {
    this.dialog.closeAll();
    if (this.aircraftDlg) {
      return;
    }
    this.aircraftDlg = this.dialog.open(AircraftDialogComponent, {
      hasBackdrop: false,
      width: '60vw'
    });
    this.aircraftDlg.afterClosed().subscribe(
      _ => this.aircraftDlg = null
    );
  }

  openLocationDlg() {
    this.dialog.closeAll();
    if (this.locationDlg) {
      return;
    }
    this.locationDlg = this.dialog.open(SelLocationDialogComponent, {
      hasBackdrop: false,
      width: '50vw'
    });
    this.locationDlg.afterClosed().subscribe(
      _ => this.locationDlg = null
    );
  }

  openWindCondDlg() {
    this.dialog.closeAll();
    if (this.windCondDlg) {
      return;
    }
    this.windCondDlg = this.dialog.open(WindConditionsDialogComponent, {
      hasBackdrop: false,
      position: { right: '10px', top: '80px' },
      panelClass: 'transparent-dialog-container'
    });
    this.windCondDlg.afterClosed().subscribe(
      _ => this.windCondDlg = null
    );
  }

  openAircraftStateDlg() {
    this.dialog.closeAll();
    if (this.aircraftStateDlg) {
      return;
    }
    this.aircraftStateDlg = this.dialog.open(AircraftStateDialogComponent, {
      hasBackdrop: false,
      position: { right: '10px', top: '80px' },
      panelClass: 'transparent-dialog-container',
    });
    this.aircraftStateDlg.afterClosed().subscribe(
      _ => this.aircraftStateDlg = null
    );
  }


  async logout() {
    await this.afAuth.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
