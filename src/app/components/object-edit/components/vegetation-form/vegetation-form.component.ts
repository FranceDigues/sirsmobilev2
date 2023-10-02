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
        if (this.EOS.objectType === 'PeuplementVegetation') {
            const find = this.EOS.refs.RefTypePeuplementVegetation.find(item => item.libelle === this.EOS.selectedLayer.title);
            if (find && find.id) {
                this.EOS.objectDoc.typeVegetationId = find.id;
            }

        } else if (this.EOS.objectType === 'InvasiveVegetation') {
            const find = this.EOS.refs.RefTypeInvasiveVegetation.find(item => item.libelle === this.EOS.selectedLayer.title);
            if (find && find.id) {
                this.EOS.objectDoc.typeVegetationId = find.id;
            }
        } else if (this.EOS.objectType === 'ArbreVegetation') {
            const find = this.EOS.refs.RefEspeceArbreVegetation.find(item => item.libelle === this.EOS.selectedLayer.title);
            if (find && find.id) {
                this.EOS.objectDoc.especeId = find.id;
            }
        }
        // else if (this.EOS.objectType === 'HerbaceeVegetation') {}
    }

    drawPolygon() {
        this.drawPolygonEvent.emit('draw');
    }

    selectPos() {
        this.selectPosEvent.emit('selectPos');

    }
}
