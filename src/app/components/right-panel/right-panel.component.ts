import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.scss'],
})
export class RightPanelComponent implements OnInit {

  @Input() slidePath: string;

  constructor() { }

  ngOnInit() {}

}
