import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EditObjectService } from "../../../../services/edit-object.service";

@Component({
    selector: 'app-vegetation-form',
    templateUrl: './vegetation-form.component.html',
    styleUrls: ['./vegetation-form.component.scss'],
})
export class VegetationFormComponent implements OnInit {
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
