import { Environment } from 'src/app/models/environment';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewerService } from 'src/app/services/viewer.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { CesiumUtils } from 'src/app/cesium/utils';

@Component({
  selector: 'app-edit-location-dialog',
  templateUrl: './edit-location-dialog.component.html',
  styleUrls: ['./edit-location-dialog.component.scss']
})
export class EditLocationDialogComponent implements OnInit {
  waitUserClkByMap = [false, false];
  geocodeService;
  searchQuery: String;
  oldCameraMode;

  constructor(
    @Inject(MAT_DIALOG_DATA) public model: Environment,
    private viewerServ: ViewerService,
    private userServ: UserService,
  ) {
    this.geocodeService = new Cesium.BingMapsGeocoderService({
      key: environment.bingMapsGeocoderServiceKey
    });

  }

  ngOnInit() {
    this.searchQuery = "";
    if (this.viewerServ.instanceExists('main')) {
      this.oldCameraMode = this.viewerServ.instance('main').viewMode;
      this.viewerServ.instance('main').setViewMode('FREE');

      const pilotLoc = CesiumUtils.degreesToCartesian(this.model.pilot);
      const airLoc = CesiumUtils.degreesToCartesian(this.model.takeoff);
      this.viewerServ.instance('main').addAirMarker(airLoc, () => this.model.takeoff.angle);
      this.viewerServ.instance('main').addPilotMarker(pilotLoc);
      this.viewerServ.instance('main').viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromCartesianArray([pilotLoc, airLoc]),
      });
    }
  }

  revertMainMapState() {
    if (this.viewerServ.instanceExists('main')) {
      this.viewerServ.instance('main').clearMauseClkMarkers();
      this.viewerServ.instance('main').setViewMode(this.oldCameraMode);
    }
  }

  save() {
    this.userServ.saveUserContent('environment', this.model, true);
  }

  go() {
    if (!this.searchQuery) {
      return;
    }
    this.geocodeService.geocode(this.searchQuery).then(
      res => {
        if (this.viewerServ.instance('main') && res[0]) {
          this.viewerServ.instance('main').viewer.camera.flyTo({ destination: res[0].destination });
        }
      });
  }

  takeoffLoc() {
    this.waitUserClkByMap[0] = true;

    if (this.viewerServ.instanceExists('main')) {
      this.viewerServ.instance('main').getMouseClkLocation('air')
        .then(res => this.model.takeoff = { ...res.pos, angle: res.angle })
        .catch(err => console.log(err))
        .finally(() => this.waitUserClkByMap[0] = false);
    }
  }

  pilotLoc() {
    this.waitUserClkByMap[1] = true;
    if (this.viewerServ.instanceExists('main')) {
      this.viewerServ.instance('main').getMouseClkLocation('pilot')
        .then(res => this.model.pilot = { ...res.pos })
        .catch(err => console.log(err))
        .finally(() => this.waitUserClkByMap[1] = false);
    }
  }
}
