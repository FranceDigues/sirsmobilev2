import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EditObjectService } from "../../../../services/edit-object.service";
import { GeolocationService } from "../../../../services/geolocation.service";

@Component({
    selector: 'app-default-form',
    templateUrl: './default-form.component.html',
    styleUrls: ['./default-form.component.scss'],
})
export class DefaultFormComponent implements OnInit {
    @Output() selectPosEvent = new EventEmitter<string>();
    @Output() selectPosBySREvent = new EventEmitter<string>();

    constructor(public EOS: EditObjectService,
                public geolocationService: GeolocationService) {
    }

    ngOnInit() {
    }

    selectPos() {
        this.selectPosEvent.emit('selectPos');
    }

    getStartPositionValue() {
        // Try to get GPS precision info
        const precisionGPSText = this.geolocationService.getGPSAccuracy() ? ', précision actuelle du GPS : +/- ' + this.geolocationService.getGPSAccuracy() + ' m' : '';

        return this.EOS.getStartPos() + precisionGPSText;
    }

    selectPosBySR() {
        this.selectPosBySREvent.emit('selectPosBySREvent');
    }
}
