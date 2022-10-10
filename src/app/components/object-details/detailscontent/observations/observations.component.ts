import { Component, OnInit } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
    selector: 'observations-generic',
    templateUrl: './observations.component.html',
    styleUrls: ['./observations.component.scss', '../detailscontent.component.scss'],
})
export class ObservationsGenericComponent {

    constructor(public detailsObject: ObjectDetails) {
    }

    hasPhoto(obs) {
        if (obs.photos && obs.photos.length > 0 && this.detailsObject.selectedObject['_attachments']) {
            for (let i = 0; i < obs.photos.length; i++) {
                if (this.detailsObject.selectedObject['_attachments'][obs.photos[i].id]) {
                    return true;
                }
            }
        } else {
            return false;
        }
    }

}
