import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CesiumAircraft } from '../models/aircraft';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';

export class Aircraft {
  instanceID: string;
  private positionCartesian;
  private positionCartographic;
  private orientationLocal;
  private orientationGlobal;
  positionCP;
  orientationCP;
  cesiumAircraftSubj: BehaviorSubject<CesiumAircraft>;

  constructor(
    instanceID: string
  ) {
    this.cesiumAircraftSubj = new BehaviorSubject(null);
    this.setPositionCartographic( new Cesium.Cartographic(-66.121996, 18.469053, 30.0));
    this.setOrientationLocal( new Cesium.Quaternion.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(0.0, 0.0, 0.0)));
    this.instanceID = instanceID;
    this.positionCP = new Cesium.CallbackProperty((time, result) => {
      return this.positionCartesian;
    }, false);
    this.orientationCP = new Cesium.CallbackProperty((time, result) => {
        return this.orientationGlobal;
    }, false);
  }

  getPositionCartesian() {
      return this.positionCartesian;
  }

  setPositionCartesian(pos) {
      this.positionCartesian = pos;
      this.positionCartographic = Cesium.Cartographic.fromCartesian(this.positionCartesian);
      this.updateAircraftSubj();
  }

  getPositionCartographic() {
      return this.positionCartographic;
  }

  setPositionCartographic(pos) {
      this.positionCartographic = pos;
      this.positionCartesian = Cesium.Cartographic.toCartesian(this.positionCartographic);
      this.updateAircraftSubj();
  }

  getOrientationGlobal() {
      return this.orientationGlobal;
  }

  getOrientationLocal() {
      return this.orientationLocal;
  }

  setOrientationLocal(quat) {
      this.orientationLocal = quat;
      const hpr = new Cesium.HeadingPitchRoll.fromQuaternion(quat);
      this.orientationGlobal = Cesium.Transforms.headingPitchRollQuaternion(this.positionCartesian, hpr);
      this.updateAircraftSubj();
  }

  public setOrientByHeading(angle: number) {
      const hpr = new Cesium.HeadingPitchRoll(angle, 0.0, 0.0);
      this.orientationGlobal = Cesium.Transforms.headingPitchRollQuaternion(this.positionCartesian, hpr);
      this.updateAircraftSubj();
  }

  updateAircraftSubj() {
    this.cesiumAircraftSubj.next({
      posCartesian: this.positionCartesian,
      posCartographic: this.positionCartographic,
      rotLocal: this.orientationLocal,
      rotGlobal: this.orientationGlobal
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class AircraftService {
  private aircraftInstances: {};

  constructor(
    private db: AngularFirestore,
    private userServ: UserService
  ) {
    this.aircraftInstances = {};
  }

  createInstance(instanceID: string) {
    this.aircraftInstances[instanceID] = new Aircraft(instanceID);
    return this.aircraftInstances[instanceID];
  }

  deleteInstance(instanceID: string) {
    if (this.instanceExists(instanceID)) {
      delete this.aircraftInstances[instanceID];
    }
  }

  instanceExists(instanceID: string) {
    return this.aircraftInstances[instanceID] !== undefined;
  }

  instance(instanceID: string) {
    return this.aircraftInstances[instanceID];
  }

}
