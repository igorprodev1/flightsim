import { GamepadService } from './services/gamepad.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor( private gamepadServ: GamepadService) {
  }
}
