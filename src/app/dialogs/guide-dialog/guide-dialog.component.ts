import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-guide-dialog',
  templateUrl: './guide-dialog.component.html',
  styleUrls: ['./guide-dialog.component.scss']
})
export class GuideDialogComponent implements OnInit {
  guideText: String;

  constructor() {
    this.guideText = "";
  }

  ngOnInit() {
  }

}
