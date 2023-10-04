import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EditObjectService } from "../../../../services/edit-object.service";

@Component({
  selector: 'app-dependence-form',
  templateUrl: './dependence-form.component.html',
  styleUrls: ['./dependence-form.component.scss'],
})
export class DependenceFormComponent implements OnInit {
  @Output() drawPolygonEvent = new EventEmitter<string>();
  @Output() selectPosEvent = new EventEmitter<string>();

  constructor(public EOS: EditObjectService) {
  }

  ngOnInit() {
  }

  drawPolygon() {
    this.drawPolygonEvent.emit('draw');
  }

  selectPos() {
    this.selectPosEvent.emit('selectPos');

  }
}
