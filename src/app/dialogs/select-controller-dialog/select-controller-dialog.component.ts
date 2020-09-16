import { User } from 'src/app/models/user';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigControllerDialogComponent } from '../config-controller-dialog/config-controller-dialog.component';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { Controller } from 'src/app/models/controller'

@Component({
  selector: 'app-select-controller-dialog',
  templateUrl: './select-controller-dialog.component.html',
  styleUrls: ['./select-controller-dialog.component.scss']
})
export class SelectControllerDialogComponent {
  selectedController;
  confControllerDlg;
  controllers$;
  private controllerUpdateSubs: Subscription;

  defaultControllerName: string;
  constructor(
    private dialog: MatDialog,
    private userServ: UserService
  ) {
    this.updateData();
    this.controllerUpdateSubs = this.userServ.defaultControllerSubj.subscribe( (controller: Controller) => {
      if (controller) {
        this.defaultControllerName = controller.name;
      }
    });
  }

  async updateData() {
    this.controllers$ = this.userServ.getUserContent('controller');
  }

  async setAsDefault(id) {
    this.userServ.setDefaultSetting('controller', id);
  }

  async delete(id) {
    if (await this.userServ.contentIsReadOnly('controller', id)) {
      this.userServ.notifyUser('This controller cannot be deleted');
    }
    else {
      await this.userServ.deleteUserContent('controller', id);
      this.updateData();
    }
  }

  async openConfControllerDlg(id = null) {
    let controller;
    if (id) {
      if (await this.userServ.contentIsReadOnly('controller', id)) {
        this.userServ.notifyUser('This controller cannot be edited')
        return;
      }
      controller = await this.userServ.getUserContent('controller', id);
    }
    else {
      controller = null;
    }
    
    this.dialog.closeAll();
    this.confControllerDlg = this.dialog.open(ConfigControllerDialogComponent, {
      hasBackdrop: false,
      width: '70vw',
      data: controller
    });
  }

}
