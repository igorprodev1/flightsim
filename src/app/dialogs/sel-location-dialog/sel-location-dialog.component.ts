import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewLocationDialogComponent } from '../new-location-dialog/new-location-dialog.component';
import { EditLocationDialogComponent } from '../edit-location-dialog/edit-location-dialog.component';
import { Environment } from 'src/app/models/environment';
import { CesiumUtils, DEG_IN_RAD } from 'src/app/cesium/utils';
import { ViewerService } from './../../services/viewer.service';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-sel-location-dialog',
  templateUrl: './sel-location-dialog.component.html',
  styleUrls: ['./sel-location-dialog.component.scss']
})
export class SelLocationDialogComponent implements OnInit {
  locations;
  newLocationDlg;
  editLicationDlg;
  selectedEnv: Environment;
  viewer;
  lastSelectedPin;
  pins = [];

  constructor(
    private dialog: MatDialog,
    private viewerServ: ViewerService,
    private userServ: UserService,
    private dialogRef: MatDialogRef<SelLocationDialogComponent>
  ) {
    dialogRef.afterClosed().subscribe(
      () => {
        if (this.viewerServ.instanceExists('main')) {
          if (this.viewerServ.instance('main').viewMode === 'FREE') {
            this.viewerServ.instance('main').setViewMode('FREE');
          }
        }
      });
  }

  ngOnInit() {
    this.viewer = this.viewerServ.createInstance('globe', 'globe').viewer;
    this.refreshData();
    this.viewer.selectedEntityChanged.addEventListener((newEntity) => {
      if (this.lastSelectedPin && this.lastSelectedPin.billboard) {
        this.lastSelectedPin.billboard.show = false;
      }
      this.lastSelectedPin = newEntity;
      if (this.lastSelectedPin && this.lastSelectedPin.billboard) {
        this.lastSelectedPin.billboard.show = true;
        this.selectedEnv = this.locations.filter((i) => i.name === this.lastSelectedPin.name)[0];
        this.changeCamerasLocations(this.selectedEnv.takeoff);
      }
    });
  }

  refreshData() {
    for (var i=0; i<this.pins.length; i++) {
      this.viewer.entities.remove(this.pins[i]);
    }
    const pinBuilder = new Cesium.PinBuilder();
    this.userServ.getUserContent('environment').then(
      envs => {
        this.locations = envs;
        this.pins = this.locations.map((l: Environment) => {
          return this.viewer.entities.add({
            name: l.name,
            position: CesiumUtils.degreesToCartesian(l.takeoff),
            billboard: {
              show: false,
              image: pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
              heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            },
            point: {
              pixelSize: 10,
              color: Cesium.Color.ROYALBLUE,
              outlineWidth: 2,
              outlineColor: Cesium.Color.WHITE
            }
          });
        });
      }
    );
  }

  changeCamerasLocations(location) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(location.longitude*DEG_IN_RAD, location.latitude*DEG_IN_RAD, 1000.0)
    });
  }

  fly() {
    this.userServ.setDefaultSetting('environment', this.selectedEnv.name);
  }

  async delete() {
    if (await this.userServ.contentIsReadOnly('environment', this.selectedEnv.name)) {
      this.userServ.notifyUser('This location cannot be deleted');
    }
    else {
      await this.userServ.deleteUserContent('environment', this.selectedEnv.name);
      this.refreshData();
    }
  }

  selectLoc(location, index) {
    this.selectedEnv = location;
    const pin = this.pins[index];

    if (this.lastSelectedPin && this.lastSelectedPin.billboard) {
      this.lastSelectedPin.billboard.show = false;
    }
    this.lastSelectedPin = pin;
    if (this.lastSelectedPin && this.lastSelectedPin.billboard) {
      this.lastSelectedPin.billboard.show = true;
    }
    this.changeCamerasLocations(location.takeoff);
  }

  openNewLocationDlg() {
    this.dialog.closeAll();
    this.newLocationDlg = this.dialog.open(NewLocationDialogComponent, {
      hasBackdrop: false,
      width: '400px',
      disableClose: true,
      position: { top: '25%', left: '0px' }
    });
  }

  async openEditLocationDlg() {
    if (await this.userServ.contentIsReadOnly('environment', this.selectedEnv.name)) {
      this.userServ.notifyUser('This location cannot be edited')
      return;
    }
    this.dialog.closeAll();
    this.editLicationDlg = this.dialog.open(EditLocationDialogComponent, {
      hasBackdrop: false,
      width: '400px',
      disableClose: true,
      data: this.selectedEnv,
      position: { top: '25%', left: '0px' }
    });
  }
}
