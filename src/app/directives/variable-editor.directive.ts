import { Utils } from './../utils/Utils';
import { SimulationServerService } from './../services/simulation-server.service';
import { Component, Input, EventEmitter, Output, HostListener, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { interval } from 'rxjs';
import { VariableDefinition } from '../models/variable-definition';

const UPDATE_VAR_DURATION = 100;

@Component({
  selector: 'simserv-variable-editor',
  inputs: ['variable'],
  template: `
    <mat-form-field *ngIf="v?.type=='float'; else select" style="width: 100%;" >
        <input matInput type="text" 
        [matTooltip]="varDef && varDef.tooltip?varDef.tooltip:null"
        matTooltipPosition='before'
        [disabled]="v.readOnly" 
        [value]="v?.value" [id]="v?.id"
        (focusout)="onFocusOut($event)" (focus)="onFocus()" 
        (keydown.arrowdown)="onArrowDown()" (keydown.arrowup)="onArrowUp()"    
        (input)="onInput($event)"
        (keydown.enter)="onEnter($event)"
        >
        <mat-hint *ngIf="varDef.showRangeHint" align="end">{{'Min value:'+ v.range.min + ', Max value:' + v.range.max}}</mat-hint>
    </mat-form-field>
    
    <ng-template #select>
      <mat-form-field style="width: 100%;" >
          <mat-select [value]="v?.value"  
          [matTooltip]="varDef && varDef.tooltip?varDef.tooltip:null" matTooltipPosition='before'
            (focusout)="onFocusOut()" (focus)="onFocus()"
            (selectionChange)="setValue($event.value)">
              <mat-option [value]="o" *ngFor="let o of v?.range.options">{{o}}</mat-option>
          </mat-select>
      </mat-form-field>
    </ng-template>
  `
})
export class VariableEditorDirective implements OnInit, OnDestroy {
  @Input('variableDefinition') public varDef;
  public v;


  floatNumberRegExp = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  prevInputValue = '';
  interval;

  constructor(private simulationServ: SimulationServerService) {
  }

  ngOnInit() {
    const s = this.simulationServ.getVariable(this.varDef).subscribe(v => {
      v.value = this.cutNumber(v.value);
      this.v = v;
      this.prevInputValue = this.v.value;
      // scroll
      setTimeout(() => {
        const elem = document.getElementById(this.v.id);
        if (!elem) return;
        elem.addEventListener('wheel', (evt) => {
          evt.stopPropagation();
  
          const step = this.varDef && this.varDef.step? this.varDef.step: 1;
          let newVal = this.v.value;
          if (evt.deltaY > 0) {
            newVal = this.v.value - step;
          } else {
            newVal = this.v.value + step;
          }
          if (this.isInRange(newVal)) {
            this.setValue(newVal);
          }
        }, { capture: false, passive: true });
      }, 500);
      this.startUpdateVariableLoop(this.varDef, UPDATE_VAR_DURATION);
      s.unsubscribe();
    });
  
  }

  ngOnDestroy(): void {
    if (!this.interval) return;
    this.interval.unsubscribe();
  }

  private cutNumber(val) {
    if (typeof val == 'number') 
      return +((+val).toFixed( this.varDef.precision || 1 ));
    return val;
  }

  setValue(val) {
    if(!Utils.isExists(val)) return;
    if (typeof val == 'number') {
      this.v.value = this.cutNumber(val);
    } else {
      this.v.value = val;
    }
    
    this.simulationServ.setVariable(this.varDef, this.v.value).subscribe(
      res => console.log('variable saving response', res)
    );
  }

  isInRange(val) {
    if (Utils.isExists(this.v.range.min) && val < this.v.range.min) return false;
    if (Utils.isExists(this.v.range.max) && val > this.v.range.max) return false;
    return true;
  }
  
  onEnter(e) {
    this.checkRangeAndSave(e);
  }
  
  private checkRangeAndSave(e) {
    console.log(e.target.value);
    if (this.floatNumberRegExp.test(e.target.value)) {
      const val = +e.target.value;
      if (Utils.isExists(this.v.range.min) && val < this.v.range.min) {
        e.target.value = this.v.range.min;
      } else if (Utils.isExists(this.v.range.max) && val > this.v.range.max) {
        e.target.value = this.v.range.max;
      }
      this.prevInputValue = e.target.value;
    } else {
      e.target.value = this.prevInputValue;
    }
    this.setValue(e.target.value);
  }

  onInput(e) {
  }

  onArrowDown() {
    const step = this.varDef && this.varDef.step? this.varDef.step: 1;
    const tmp = this.v.value - step;
    if (Utils.isExists(this.v.range.min) && tmp < this.v.range.min) {
      this.setValue(this.v.range.min);
    } else {
      this.setValue(tmp);
    }
  }

  onArrowUp() {
    const step = this.varDef && this.varDef.step? this.varDef.step: 1;
    const tmp = this.v.value + step;
    if (Utils.isExists(this.v.range.max) && tmp > this.v.range.max) {
      this.setValue(this.v.range.max);
    } else {
      this.setValue(tmp);
    }
  }

  startUpdateVariableLoop(varDef: VariableDefinition, delay = UPDATE_VAR_DURATION) {
    console.log('start update interval', varDef.variableId)
    this.interval = interval(delay).subscribe((ms) => {
      this.simulationServ.getVariableValue(varDef).subscribe(
        (res: any) => {
          this.v.value = this.cutNumber(res.value);
        }
      );
    });
  }

  stopUpdateVariableLoop() {
    console.log('stop update variable loop');
    if (!this.interval) return;
    this.interval.unsubscribe();
  }

  onFocusOut(e) {
    if (!e) return;
    this.checkRangeAndSave(e);
    this.startUpdateVariableLoop(this.varDef, UPDATE_VAR_DURATION);
  }

  onFocus() {
    this.stopUpdateVariableLoop();
  }
}
