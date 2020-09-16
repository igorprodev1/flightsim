import { Injectable, OnDestroy } from '@angular/core';
import { AircraftService } from './aircraft.service';
import { UserService } from './user.service';
import { CesiumUtils } from 'src/app/cesium/utils';
import { Subscription } from 'rxjs';
import { FirebaseAircraft } from '../models/aircraft';
import { Environment } from '../models/environment';
import { User } from '../models/user';
import { Tile } from '../models/tile';
import { environment } from 'src/environments/environment';

export class CesiumViewer implements OnDestroy {
  markers = {
      pilot: null,
      air: null
  };
  private aircraftEntities = {};
  private acUpdateSubs: Subscription;
  private envUpdateSubs: Subscription;
  private cgMarkerEntity;
  viewer;
  viewMode;
  debuggingCamera;
  groundCameraPositionCartesian;
  groundCameraPositionCartographic;
  mainAircraftInstanceId: string;
  terrainProvider;
  aircraftModelUri;

  constructor(
    private domID: string,
    private aircraftServ: AircraftService,
    private userServ: UserService
  ) {
    this.viewMode = 'GROUND';
    this.terrainProvider = Cesium.createWorldTerrain()
    this.viewer = new Cesium.Viewer(domID, {
        shouldAnimate: false,
        animation: false,
        // cesium issue, incorrect mouse position
        // baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        shadows: true,
        vrButton: false,
        terrainProvider: this.terrainProvider
    });
    if (environment.production == false) {
        this.viewer.scene.debugShowFramesPerSecond = true;
    }
    this.viewer.scene.globe.tileCacheSize = 1000;
    this.viewer.scene.globe.preloadSiblings = true;
    this.cgMarkerEntity = this.viewer.entities.add({
        id: 'cgMarker',
        name: 'cgMarker',
        model: {
            uri: 'assets/models/CG_Marker.gltf'
        }
    });
    this.viewer.clock.onTick.addEventListener(function() {
            this.updateCamera();
        },
    this);
      //TODO: Implement getting resource directly from Cesium Ion
      //this.acUpdateSubs = this.userServ.defaultAircraftSubj.subscribe( (aircraft: FirebaseAircraft) => {
      //  if (aircraft && aircraft.cesiumAssetID) {
      //      Cesium.IonResource.fromAssetId(Number(aircraft.cesiumAssetID)).then(function (resource) {
      //          for (const key in this.aircraftEntities) {
      //              this.aircraftEntities[key].model.uri = resource;
      //          }
      //      });
      //  }
      //}); 
      this.acUpdateSubs = this.userServ.defaultAircraftSubj.subscribe( (ac: FirebaseAircraft) => {
        if (ac) {
            this.aircraftModelUri = ac.model;
            for (const key in this.aircraftEntities) {
                this.aircraftEntities[key].model.uri = ac.model;
            }
        }
      });
      this.envUpdateSubs = this.userServ.defaultEnvironmentSubj.subscribe( (env: Environment) => {
          if (env) {
              this.setGroundCameraPosition(CesiumUtils.degreesToCartesian(env.pilot));
          }
      });
      this.userServ.getUserContent("tiles").then(tiles =>{
        for (var i=0; i<tiles.length; i++) {
            let tile: Tile = tiles[i];
            this.viewer.scene.primitives.add(
                new Cesium.Cesium3DTileset({
                    url: Cesium.IonResource.fromAssetId(Number(tile.cesiumAssetID))
                })
            );
        }
      });
  }

  ngOnDestroy() {
    if (this.acUpdateSubs) {
      this.acUpdateSubs.unsubscribe();
    }
    if (this.envUpdateSubs) {
        this.envUpdateSubs.unsubscribe();
    }
  }

  public addAircraftInstance(instanceID: string, modelURI: string = 'assets/models/Cesium_Air.gltf') {
    const entity = {
      name: 'aircraft',
      position: this.aircraftServ.instance(instanceID).positionCP,
      orientation: this.aircraftServ.instance(instanceID).orientationCP,
      model: {
          uri: modelURI
      },
    };
    this.aircraftEntities[instanceID] = this.viewer.entities.add(entity);
    this.mainAircraftInstanceId = instanceID;
    this.cgMarkerEntity.position = this.aircraftServ.instance(instanceID).positionCP;

  }

  public removeAircraftInstance(instanceID: string) {
    if (instanceID in this.aircraftEntities) {
      this.viewer.entities.remove(this.aircraftEntities[instanceID]);
    }
  }

  public addPilotMarker(position) {
    if (this.markers.pilot) {
        this.viewer.entities.remove(this.markers.pilot);
        this.markers.pilot = null;
    }

    const orientationCP = new Cesium.CallbackProperty((time, result) => {
        return Cesium.Transforms.headingPitchRollQuaternion(position,
            new Cesium.HeadingPitchRoll(CesiumUtils.rotateToEntity(this.markers.air.position.getValue(), position), 0.0, 0.0));
    }, false);

    this.markers.pilot = this.viewer.entities.add({
        name: 'pilot',
        position: position,
        orientation: orientationCP,
        model: {
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            minimumPixelSize: 100,
            maximumScale: 100,
            uri: 'assets/models/pilot_icon.glb'
        }
    });

    return this.markers.pilot;
  }

  public addAirMarker(position, angleCb = null) {
      if (this.markers.air) {
          this.viewer.entities.remove(this.markers.air);
          this.markers.air = null;
      }

      const orientationCP = new Cesium.CallbackProperty((time, result) => {
          return Cesium.Transforms.headingPitchRollQuaternion(position,
              new Cesium.HeadingPitchRoll(angleCb(), 0.0, 0.0));
      }, false);

      this.markers.air = this.viewer.entities.add({
          name: 'air',
          position: position,
          orientation: orientationCP,
          model: {
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              minimumPixelSize: 100,
              maximumScale: 100,
              uri: this.aircraftModelUri ? this.aircraftModelUri: 'assets/models/Cesium_Air.gltf'
          }
      });

      return this.markers.air;
  }

  public createPoint(worldPosition) {
      const point = this.viewer.entities.add({
          position: worldPosition,
          point: {
              color: Cesium.Color.WHITE,
              pixelSize: 5,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
      });
      return point;
  }

  // get mouse clicked location
  // https://cesiumjs.org/Cesium/Apps/Sandcastle/index.html?src=Drawing%20on%20Terrain.html&label=All
  public getMouseClkLocation(markerType: 'air' | 'pilot', angle = null): Promise<any> {
      return new Promise((resolve, reject) => {
          const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
          let angleVal = 0;
          let position;
          handler.setInputAction((event) => {
              const earthPosition = this.viewer.scene.pickPosition(event.position);
              if (Cesium.defined(earthPosition)) {
                  if (markerType === 'pilot') {
                      this.addPilotMarker(earthPosition);
                      handler.destroy();
                      return resolve({ pos: Cesium.Cartographic.fromCartesian(earthPosition), angle: angleVal });
                  }
                  if (markerType === 'air') {
                    if (position) {
                        handler.destroy();
                        return resolve({ pos: Cesium.Cartographic.fromCartesian(earthPosition), angle: angleVal });
                    }
                    this.addAirMarker(earthPosition, () => angleVal);
                    position = earthPosition;
                    handler.setInputAction((mmEvent) => {
                        const newPosition = this.viewer.scene.pickPosition(mmEvent.endPosition);
                        if (Cesium.defined(newPosition)) {
                            angleVal = CesiumUtils.rotateToEntity(newPosition, position);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                  }
              } else {
                  reject(earthPosition);
              }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      });
  }

  public clearMauseClkMarkers() {
      this.viewer.entities.remove(this.markers.air);
      this.markers.air = null;
      this.viewer.entities.remove(this.markers.pilot);
      this.markers.pilot = null;
  }

  setupDebuggingCamera() {
      this.debuggingCamera = new Cesium.Camera(this.viewer.scene);
      this.debuggingCamera.position = new Cesium.Cartesian3.fromDegrees(10, 45.0, 50000.0);
      this.debuggingCamera.direction = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3());
      this.debuggingCamera.up = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_Y);
      this.debuggingCamera.frustum.fov = Cesium.Math.PI_OVER_THREE;
      this.debuggingCamera.frustum.near = 1.0;
      this.debuggingCamera.frustum.far = 2.0;

      const pr = this.viewer.scene.primitives.add(new Cesium.DebugCameraPrimitive({
          camera: this.debuggingCamera,
          color: Cesium.Color.YELLOW
      }));
  }

  public setViewMode(mode) {
      if (this.aircraftEntities[this.mainAircraftInstanceId] == null) {
          return;
      }
      this.viewer.trackedEntity = undefined;
      this.aircraftEntities[this.mainAircraftInstanceId].show = true;
      this.cgMarkerEntity.show = true;
      this.viewMode = mode;
      this.viewer.camera.frustum.fov = 80.0 * (Math.PI / 180.0);

      // Set appropriate settings according to view mode
      if (this.viewMode === 'FOLLOW') {
          this.viewer.trackedEntity = this.cgMarkerEntity;
          this.enableMouseControls(true);
      } else if (this.viewMode === 'FREE') {
          const hpr = new Cesium.HeadingPitchRange(0.0, Cesium.Math.toRadians(-20.0), 200.0);
          this.viewer.zoomTo(this.aircraftEntities[this.mainAircraftInstanceId], hpr);
          this.enableMouseControls(true);
      } else if (this.viewMode === 'FPV') {
          this.aircraftEntities[this.mainAircraftInstanceId].show = false;
          this.cgMarkerEntity.show = false;
          this.enableMouseControls(false);
      } else if (this.viewMode === 'GROUND') {
          this.enableMouseControls(false);
      }

      this.updateCamera();
  }

  public enableMouseControls(enable) {
      this.viewer.scene.screenSpaceCameraController.enableRotate = enable;
      this.viewer.scene.screenSpaceCameraController.enableTranslate = enable;
      this.viewer.scene.screenSpaceCameraController.enableZoom = enable;
      this.viewer.scene.screenSpaceCameraController.enableTilt = enable;
      this.viewer.scene.screenSpaceCameraController.enableLook = enable;
  }

  private updateCamera() {
      if (this.aircraftEntities[this.mainAircraftInstanceId] == null || this.groundCameraPositionCartographic == null ||
       this.groundCameraPositionCartesian == null) {
          return;
      }

      let cameraPos;
      let cameraHeading;
      let cameraPitch;
      let cameraRoll;

      if (this.viewMode === 'FPV') {
          const hpr = new Cesium.HeadingPitchRoll.fromQuaternion(this.aircraftServ.instance(this.mainAircraftInstanceId).getOrientationLocal());
          cameraHeading = hpr.heading + Math.PI / 2.0;
          cameraPitch = hpr.pitch;
          cameraRoll = hpr.roll;
          cameraPos = this.aircraftServ.instance(this.mainAircraftInstanceId).getPositionCartesian();
      } else if (this.viewMode === 'GROUND') {
          // Update ground camera position and orientation
          const phi1 = this.aircraftServ.instance(this.mainAircraftInstanceId).getPositionCartographic().latitude * Math.PI / 180.0;
          const phi2 = this.groundCameraPositionCartographic.latitude * Math.PI / 180.0;
          const lam1 = this.aircraftServ.instance(this.mainAircraftInstanceId).getPositionCartographic().longitude * Math.PI / 180.0;
          const lam2 = this.groundCameraPositionCartographic.longitude * Math.PI / 180.0;
          const groundCameraBearing = Math.atan2(Math.sin(lam2 - lam1) * Math.cos(phi2), Math.cos(phi1) * Math.sin(phi2)
              - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lam2 - lam1)) * 180 / Math.PI;
          const dist = Cesium.Cartesian3.distance(this.groundCameraPositionCartesian,
            this.aircraftServ.instance(this.mainAircraftInstanceId).getPositionCartesian());

          // Adjust camera field of view to zoom in as aircraft moves far away
          let fov = 20.0 * Math.atan(3.0 / dist);
          if (fov < 15.0 * (Math.PI / 180.0)) {
              fov = 15.0 * (Math.PI / 180.0);
          } else if (fov > 80.0 * (Math.PI / 180.0)) {
              fov = 80.0 * (Math.PI / 180.0);
          }
          this.viewer.camera.frustum.fov = fov;

          // Adjust tilt to maintain ground within view
          let distRatio = 0;
          let tilt = 0;

          let verticalFOV = fov;
          if (this.viewer.camera.frustum.aspectRatio > 1.0) {
              verticalFOV = fov / this.viewer.camera.frustum.aspectRatio;
          }
          distRatio = 1.25 * (this.aircraftServ.instance(this.mainAircraftInstanceId).getPositionCartographic().height -
            this.groundCameraPositionCartographic.height) / dist;
          if (distRatio > 0.99) {
              distRatio = 0.99;
          } else if (distRatio < -0.99) {
              distRatio = -0.99;
          }
          const theta = Math.asin(distRatio);
          tilt = 0.0;
          if (theta > verticalFOV / 2.0) {
              tilt = theta - verticalFOV / 2.0;
          } else if (theta < -verticalFOV / 2.0) {
              tilt = theta + verticalFOV / 2.0;
          }

          cameraHeading = (groundCameraBearing - 180.0) * (Math.PI / 180.0);
          cameraPitch = tilt;
          cameraRoll = 0.0;
          cameraPos = this.groundCameraPositionCartesian;

      }

      if (this.viewMode === 'FPV' || this.viewMode === 'GROUND') {
          // if (this.debuggingCamera) {
          //     this.debuggingCamera.setView({
          //         destination: cameraPos,
          //         orientation: {
          //             heading: cameraHeading,
          //             pitch: cameraPitch,
          //             roll: cameraRoll
          //         }
          //     });
          // }

          this.viewer.camera.setView({
              destination: cameraPos,
              orientation: {
                  heading: cameraHeading,
                  pitch: cameraPitch,
                  roll: cameraRoll
              }
          });
      }


  }

  public setGroundCameraPosition(groundCameraPositionCartesian) {
      this.groundCameraPositionCartesian = null;
      this.groundCameraPositionCartographic = null;
      const groundCameraPositionCargotraphic = Cesium.Cartographic.fromCartesian(groundCameraPositionCartesian);
      const queryPoints = [groundCameraPositionCargotraphic];
      const promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, queryPoints);
      Cesium.when(promise, function(updatedQueryPoints) {
          this.groundCameraPositionCartographic = Cesium.Cartographic.fromRadians(groundCameraPositionCargotraphic.longitude,
              groundCameraPositionCargotraphic.latitude,
              updatedQueryPoints[0].height + 1.5);
          this.groundCameraPositionCartesian = Cesium.Cartographic.toCartesian(this.groundCameraPositionCartographic);
      }.bind(this));
  }

}

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private viewerInstances: {};

  constructor(
    private aircraftServ: AircraftService,
    private userServ: UserService
  ) {
    this.viewerInstances = {};
  }

  createInstance(instanceID: string, domID: string) {
    this.viewerInstances[instanceID] = new CesiumViewer(domID, this.aircraftServ, this.userServ);
    return this.viewerInstances[instanceID];
  }

  deleteInstance(instanceID: string) {
    if (this.instanceExists(instanceID)) {
      delete this.viewerInstances[instanceID];
    }
  }

  instanceExists(instanceID: string) {
    return this.viewerInstances[instanceID] !== undefined;
  }

  instance(instanceID: string) {
    return this.viewerInstances[instanceID];
  }

}
