import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GamepadService {
  buttonToggleStates: number[];
  buttonToggleDebounceTimers: number[];

  constructor() {
    window.addEventListener('gamepadconnected', (e: any) => {
      console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
    });

    window.addEventListener('gamepaddisconnected', (e: any) => {
      console.log('Gamepad disconnected from index %d: %s',
        e.gamepad.index, e.gamepad.id);
    });
    this.buttonToggleStates = [];
    this.buttonToggleDebounceTimers = [];
    setInterval(() => {
      this.updateButtonToggleStates();
    }, 1000/50);
  }

  private handleGamepad() {
    const gamepads: Gamepad[] = navigator.getGamepads ? navigator.getGamepads() :
      ((navigator as any).webkitGetGamepads ? (navigator as any).webkitGetGamepads() : []);
    if (gamepads.length === 0) { return; }

    return gamepads[0];
  }

  private updateButtonToggleStates() {
    const gp = this.handleGamepad();
    if (!gp) {
      return;
    }

    if (this.buttonToggleStates.length != gp.buttons.length) {
      this.buttonToggleStates = gp.buttons.map(b => -1.0);
      this.buttonToggleDebounceTimers = gp.buttons.map(b => 0.0);
    }

    else {
      this.buttonToggleStates = gp.buttons.map((b,i) => {
        if (b.pressed && this.buttonToggleDebounceTimers[i] <= 0.0) {
          this.buttonToggleDebounceTimers[i] = 1000/5;
          if (this.buttonToggleStates[i] > 0.0) {
            return -1.0;
          }
          else{
            return 1.0;
          }
        }
        else {
          if (this.buttonToggleDebounceTimers[i] > 0.0) {
            this.buttonToggleDebounceTimers[i] -= 1000/50;
          }
          return this.buttonToggleStates[i];
        }
      });
    }
  }

  public getButtonsAndAxes() {
    const gp = this.handleGamepad();
    if (!gp) {
      return null;
    }
  
    if (this.buttonToggleStates.length != gp.buttons.length) {
      this.buttonToggleStates = gp.buttons.map(b => -1.0);
      this.buttonToggleDebounceTimers = gp.buttons.map(b => 0.0);
    }
    console.log(this.buttonToggleStates);//TEST
    return {
      b: this.buttonToggleStates,
      a: gp.axes
    }
  }

  public getButtons() {
    const gp = this.handleGamepad();
    if (!gp) {
      return [];
    }

    if (this.buttonToggleStates.length != gp.buttons.length) {
      this.buttonToggleStates = gp.buttons.map(b => -1.0);
      this.buttonToggleDebounceTimers = gp.buttons.map(b => 0.0);
    }
    
    let buttons = gp.buttons.map((b,i) => {
      b['toggle'] = this.buttonToggleStates[i];
      return b;
    });

    return buttons;
  }

  public getAxes() {
    const gp = this.handleGamepad();
    return gp ? gp.axes : [];
  }

}
