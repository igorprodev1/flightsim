import { SystemVariable } from './../models/system-variable';
import { UserService } from 'src/app/services/user.service';
import { GamepadService } from './gamepad.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { interval, Subject, Observable } from 'rxjs';
import { Environment } from 'src/app/models/environment';
import { FirebaseAircraft } from 'src/app/models/aircraft';
import { AircraftService } from './aircraft.service';
import { ViewerService } from './viewer.service';
import { Subscription } from 'rxjs';
import { DEG_IN_RAD } from 'src/app/cesium/utils';
import { forkJoin, } from 'rxjs';
import { map, take, filter, scan, bufferCount, tap } from 'rxjs/operators';
import * as io from 'socket.io-client';
import { User } from '../models/user';
import { VariableDefinition } from '../models/variable-definition';
import { Variable } from '../models/variable';

export interface ArrayValue {
  value: Array<number>;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationServerService {
  private intervalSubs;
  private simState: string;
  private envUpdateSubs: Subscription;
  private aircraftUpdateSubs: Subscription;
  private socket;
  private terrainHeight = 0.0;
  private aircraftLatLon;
  private previousTime;

  simulationStateSubj: Subject<string>;
  getSysVarSubj: Subject<string>;
  authHeader: HttpHeaders;



  constructor(
    private http: HttpClient,
    private gamepadServ: GamepadService,
    private aircraftService: AircraftService,
    private userService: UserService,
    private viewerService: ViewerService
  ) {
    userService.currentUserObservable().subscribe((user: User) => {
      if (!user) {
        return;
      }
      const authToken = userService.currentUser().tcloudIdToken;

      this.authHeader = new HttpHeaders({
        // 'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      });
    });

    // SOCKET
    this.socket = io(environment.socketIoUrl, {
      // path: '/',
      // transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('connected');
      this.startUpdateLoop();
    });
    this.socket.on('aircraft_state', function (state) {
      this.receiveAircraftState(state);
    }.bind(this));
    // SOCKET END

    this.simulationStateSubj = new Subject();
    this.getSysVarSubj = new Subject();

    this.envUpdateSubs = this.userService.defaultEnvironmentSubj.subscribe((env: Environment) => {
      if (env) {
        this.updateEnvironment(env);
      }
    });

    this.aircraftUpdateSubs = this.userService.defaultAircraftSubj.subscribe((ac: FirebaseAircraft) => {
      if (ac) {
        this.updateAircraft(ac).subscribe(
          res => console.log(res),
          err => console.error(err)
        );
      }
    });
  }


  public setSimulationState(state: 'PAUSE' | 'RESET' | 'SIMULATE') {
    let subs;
    if (state === 'PAUSE') {
      subs = this.http.post(`${environment.simulationServer}/Aircraft/default_aircraft/pause`, {}, { headers: this.authHeader });
    } else if (state === 'RESET') {
      subs = this.http.post(`${environment.simulationServer}/Aircraft/default_aircraft/reset`, {}, { headers: this.authHeader });
    } else if (state === 'SIMULATE') {
      subs = this.http.post(`${environment.simulationServer}/Aircraft/default_aircraft/play`, {}, { headers: this.authHeader });
    }
    subs.subscribe(
      () => {
        if (state !== 'RESET') {
          this.simState = state;
        }
        this.simulationStateSubj.next(this.simState);
      },
      err => this.userService.notifyUser(err.message)
    );
  }

  public get(system: 'Aircraft' | 'Environment', componentType: string, componentNumber: number, variableID: string) {
    return this.getVariableValue({
      systemType: system,
      sys_name: system,
      componentType: componentType,
      index: componentNumber,
      variableId: variableID,
      systemId: 'default_aircraft'
    } as VariableDefinition);
    // return this.http.get(environment.simulationServer + "/" + system +
    //   "/default_aircraft?component_type=" + componentType +
    //   "&index=" + componentNumber.toString() +
    //   "&var_id=" + variableID, { headers: this.authHeader });
  }

  private updateEnvironment(env: Environment) {
    console.log('update Environment');
    
    let varDef: VariableDefinition = {
      systemType: 'Environment',
      systemId: 'default_environment',
      systemName: 'environment',
      componentType: 'georeference',
      index: 0,
      variableId: ''
    };

    varDef.variableId = `latitudeHighPrecision-deg-`;
    let subs1 = this.setVariable(varDef, env.takeoff.latitude * DEG_IN_RAD);
    
    varDef.variableId = `longitudeHighPrecision-deg-`;
    let subs2 = this.setVariable(varDef, env.takeoff.longitude * DEG_IN_RAD);
    
    varDef.variableId = `positionZ`;
    let subs3 = this.setVariable(varDef, -env.takeoff.height);
    
    let heading = -env.takeoff.angle * DEG_IN_RAD - 90.0;
    while (heading > 180.0) {
      heading = heading - 360.0;
    }
    while (heading < -180.0) {
      heading = heading + 360.0;
    }

    varDef.variableId = `rotationZ-euler-`;
    varDef.componentType = `spawnpoint`;
    
    let subs4 = this.setVariable(varDef, heading);

    forkJoin([subs1, subs2, subs3, subs4]).subscribe(results => {
      console.log('RESET');
      this.setSimulationState('RESET');
    });
  }

  private updateAircraft(ac: FirebaseAircraft) {
    console.log('update aircraft');
    // return;
    return this.http.post(`${environment.simulationServer}/Aircraft/default_aircraft/load_remote?system_name=${ac.name}`, {}, { headers: this.authHeader });
  }

  private startUpdateLoop() {
    this.intervalSubs = interval(1000 / 10).subscribe(
      () => {
        this.updateTerrainHeight();
        this.sendControls();
      }
    );
  }

  private sendControls() {
    const data = {
      sys_id: 'default_aircraft',
      joystick_state: this.mapGamepadToController(),
      ground_height: this.terrainHeight
    };
    this.socket.emit('aircraft_control', data);
  }

  private receiveAircraftState(state) {
    if (this.aircraftService.instanceExists('main') && state != null && Array.isArray(state) && state.length == 7) {
      const pos = new Cesium.Cartographic(state[1] * Math.PI / 180.0, state[0] * Math.PI / 180.0, state[2])
      this.aircraftService.instance('main').setPositionCartographic(pos);
      const quat = new Cesium.Quaternion(state[4], state[5], state[6], state[3]);
      const quat2 = new Cesium.Quaternion.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(-Math.PI / 2.0, 0.0, 0.0));
      Cesium.Quaternion.multiply(quat, quat2, quat);
      this.aircraftService.instance('main').setOrientationLocal(quat);
      this.aircraftLatLon = [state[0], state[1]]
    }

    // Optional: print update frequency to console
    if (false) {
      var date = new Date();
      var t = date.getSeconds() + date.getMilliseconds() / 1000.0;
      var dt = t - this.previousTime;
      this.previousTime = t;
      let hz = 1.0 / dt;
      console.log(hz);
    }
  }

  private updateTerrainHeight() {
    if (!this.viewerService.instanceExists('main') || !this.aircraftLatLon) {
      return;
    }
    const terrainHeightSamplePositions = [Cesium.Cartographic.fromDegrees(this.aircraftLatLon[1], this.aircraftLatLon[0])];
    const promise = Cesium.sampleTerrainMostDetailed(this.viewerService.instance('main').terrainProvider,
      terrainHeightSamplePositions);
    Cesium.when(promise, () => {
      this.terrainHeight = terrainHeightSamplePositions[0].height;
    }
    );
  }

  private mapGamepadToController() {
    const controls = this.gamepadServ.getButtonsAndAxes();
    const controller = this.userService.defaultControllerSubj.value;
    let state = [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    if (controls && controller) {
      const tmp = controller.functions.map(f => (f.inputType === null ||
        f.inputIndex === null) ? 0.0 : controls[f.inputType][f.inputIndex] * (f.reverse ? -1.0 : 1.0));
      state = [tmp[3],  // throttle
      tmp[2],  // yaw
      tmp[1],  // roll
      tmp[0],  // pitch
      tmp[4],  // aux 1
      tmp[5],  // aux 2
      tmp[6],  // aux 3
      ];
    }

    // This is required to circumvent javascript turning 0.0 into integers
    for (var ii = 0, len = state.length; ii < len; ii++) {
      if (Number.isInteger(state[ii])) {
        state[ii] += 1e-6;
      }
    }

    return state
  }

  handleSysVarReq(type: string, varDef: VariableDefinition, var_value = null) {
    const sysvar = SystemVariable.fromVariableDefinition(varDef);
    // console.log('handleSysVarReq', varDef.variableId, sysvar);
    const setSysVar = (res: any) => {
      // console.log('handleSysVarReq callback', type, res, varDef.variableId);
      if (!res) {
        this.getSysVarSubj.next({variableId: varDef.variableId, reqType:  type} as any);
        return;
      };
      this.getSysVarSubj.next({ ...res, variableId: varDef.variableId, reqType:  type});
    };
    if (var_value) {
      sysvar.var_value = var_value;
    }
    this.socket.emit(type, sysvar, setSysVar);
  }

  getVariableValue(varDef: VariableDefinition) {
    this.handleSysVarReq('get_sys_var', varDef);
    return this.getSysVarSubj.asObservable().pipe(
      filter((v: any) => v.variableId === varDef.variableId && v.reqType === 'get_sys_var'), take(1));
  }

  getVariableRange(varDef: VariableDefinition) {
    return this.handleSysVarReq('get_sys_var_range', varDef);
  }

  getVariableType(varDef: VariableDefinition) {
    return this.handleSysVarReq('get_sys_var_type', varDef);
  }
  
  getVariableReadonly(varDef: VariableDefinition) {
    return this.handleSysVarReq('get_sys_var_readonly', varDef);
  }
  
  setVariable(varDef: VariableDefinition, value: any) {
    this.handleSysVarReq('set_sys_var', varDef, value);
    return this.getSysVarSubj.asObservable().pipe(
      filter((v: any) => v.variableId === varDef.variableId  && v.reqType === 'set_sys_var')
      , take(1)
      // , tap(r => console.log('r', r))
      )
  }

  getVariable(varDef: VariableDefinition): Observable<Variable> {
    // console.log('get variable');
    this.getVariableValue(varDef);
    this.getVariableType(varDef);
    this.getVariableReadonly(varDef); 
    this.getVariableRange(varDef);

    return this.getSysVarSubj.asObservable().pipe(
      filter((v: any) => v.variableId === varDef.variableId),
      bufferCount(4),
      map((res: any) => {
        return {
          id: varDef.variableId,
          value: res[0].value,
          type: res[1].type,
          readOnly: res[2].value,
          range: res[3]
        }
      }))
  }
}
