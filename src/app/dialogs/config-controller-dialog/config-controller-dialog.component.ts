import { GamepadService } from './../../services/gamepad.service';
import { Component, OnInit, Inject, OnDestroy, ViewChild, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { Controller } from 'src/app/models/controller';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-config-controller-dialog',
  templateUrl: './config-controller-dialog.component.html',
  styleUrls: ['./config-controller-dialog.component.scss'],
})
export class ConfigControllerDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(MatProgressBar) progressBars: QueryList<MatProgressBar>;
  waitingInterval: Subscription;
  stateCheckingInterval: Subscription;

  defaultControllerConfig: Controller = {
    name: null,
    isDefault: false,
    functions: [
      { displayName: 'Pitch', name: 'pitch', reverse: false, inputType: null, inputIndex: null },
      { displayName: 'Roll', name: 'roll', reverse: false, inputType: null, inputIndex: null },
      { displayName: 'Yaw', name: 'yaw', reverse: false, inputType: null, inputIndex: null },
      { displayName: 'Throttle', name: 'throttle', reverse: false, inputType: null, inputIndex: null },
      { displayName: 'Aux 1', name: 'aux_1', reverse: false, inputType: null, inputIndex: null },
      { displayName: 'Aux 2', name: 'aux_2', reverse: false, inputType: null, inputIndex: null },
      { displayName: 'Aux 3', name: 'aux_3', reverse: false, inputType: null, inputIndex: null }
    ]
  };

  states = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public controllerConfig: any,
    private gamepadServ: GamepadService,
    private userServ: UserService
  ) {
    if (!controllerConfig) {
      this.controllerConfig = this.defaultControllerConfig;
    }
  }

  ngAfterViewInit() {
  }

  gamepadStateCheckLoop() {
    if (this.controllerConfig) {
      this.stateCheckingInterval = interval(200).subscribe(_ => {
        const buttonsVals = this.gamepadServ.getButtons();
        if (!buttonsVals || buttonsVals.length == 0) {
          this.userServ.notifyUser('No controller detected')
        }
        else {
          const axisVals = this.gamepadServ.getAxes();

          this.states = this.controllerConfig.functions.map(i => {
            if (i.inputType === 'b') {
              const val = buttonsVals[i.inputIndex]['toggle'];
              return (i.reverse ? (1 - val) : val) * 100;
            } else if (i.inputType === 'a') {
              const val = axisVals[i.inputIndex];
              return (i.reverse ? (1 - val) : val + 1) * 50;
            }
          });
        }
      });
    }
  }

  inputFieldValueCalculate(c) {
    if (!c.inputType) {
      return null;
    }
    return (c.inputType === 'b' ? 'Button ' : 'Axis ') + c.inputIndex;
  }

  ngOnInit() {
    this.gamepadStateCheckLoop();
  }

  ngOnDestroy() {
    if (this.waitingInterval) {
      this.waitingInterval.unsubscribe();
    }
    if (this.stateCheckingInterval) {
      this.stateCheckingInterval.unsubscribe();
    }
  }

  isInputAlreadyUsed(type: string, idx: number) {
    const tmp = this.controllerConfig.functions.filter(f => f.inputType === type && f.inputIndex === idx);
    return tmp.length > 0;
  }

  waitUseGP(model) {
    this.waitingInterval = interval(200).subscribe(
      _ => {
        let presedButtonIdx = null;
        this.gamepadServ.getButtons().forEach((b, i) => b.pressed ? presedButtonIdx = i : 0);
        if (presedButtonIdx != null) {
          if (!this.isInputAlreadyUsed('b', presedButtonIdx)) {
            model.inputType = 'b';
            model.inputIndex = presedButtonIdx;
          }
        } else {
          const axes = this.gamepadServ.getAxes();
          if (axes[0] === 1 || axes[0] === -1) {
            if (!this.isInputAlreadyUsed('a', 0)) {
              model.inputType = 'a';
              model.inputIndex = 0;
            }
          } else if (axes[1] === 1 || axes[1] === -1) {
            if (!this.isInputAlreadyUsed('a', 1)) {
              model.inputType = 'a';
              model.inputIndex = 1;
            }
          } else if (axes[2] === 1 || axes[2] === -1) {
            if (!this.isInputAlreadyUsed('a', 2)) {
              model.inputType = 'a';
              model.inputIndex = 2;
            }
          } else if (axes[3] === 1 || axes[3] === -1) {
            if (!this.isInputAlreadyUsed('a', 3)) {
              model.inputType = 'a';
              model.inputIndex = 3;
            }
          }
        }
      });
  }

  stopWaitingGP() {
    if (this.waitingInterval) {
      this.waitingInterval.unsubscribe();
    }
  }

  saveController() {
    this.userServ.saveUserContent('controller', this.controllerConfig, true);
  }
}
