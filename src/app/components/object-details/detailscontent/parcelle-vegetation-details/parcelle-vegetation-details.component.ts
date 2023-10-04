import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
    selector: 'parcelle-vegetation-details',
    templateUrl: './parcelle-vegetation-details.component.html',
    styleUrls: ['./parcelle-vegetation-details.component.scss', '../detailscontent.component.scss'],
})
export class ParcelleVegetationDetailsComponent {

    @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

    constructor(public detailsObject: ObjectDetails) {
    }

}
