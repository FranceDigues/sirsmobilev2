import { Component } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
    selector: 'observations-generic',
    templateUrl: './observations.component.html',
    styleUrls: ['./observations.component.scss', '../detailscontent.component.scss'],
})
export class ObservationsGenericComponent {

    constructor(public detailsObject: ObjectDetails) {
    }

    byDate(obj1: any, obj2: any) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(obj1?.date).getTime() - new Date(obj2?.date).getTime();
    }

}
