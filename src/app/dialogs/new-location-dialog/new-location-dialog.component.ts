import { ViewerService } from 'src/app/services/viewer.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Environment } from 'src/app/models/environment';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-location-dialog',
  templateUrl: './new-location-dialog.component.html',
  styleUrls: ['./new-location-dialog.component.scss']
})
export class NewLocationDialogComponent implements OnInit {
  model: Environment;
  waitUserClkByMap = [false, false];
  geocodeService;
  searchQuery;
  oldCameraMode;

  constructor(
    private viewerServ: ViewerService,
    private userServ: UserService
  ) {
    this.model = {
      name: null,
      takeoff: null,
      pilot: null
    };

    this.geocodeService = new Cesium.BingMapsGeocoderService({
      key: environment.bingMapsGeocoderServiceKey
    });
  }

  ngOnInit() {
    if (this.viewerServ.instanceExists('main')) {
      this.oldCameraMode = this.viewerServ.instance('main').viewMode;
      this.viewerServ.instance('main').setViewMode('FREE');
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

  revertMainMapState() {
    if (this.viewerServ.instanceExists('main')) {
      this.viewerServ.instance('main').clearMauseClkMarkers();
      this.viewerServ.instance('main').setViewMode(this.oldCameraMode);
    }
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
