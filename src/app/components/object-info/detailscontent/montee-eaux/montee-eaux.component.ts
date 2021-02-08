import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-montee-eaux',
  templateUrl: './montee-eaux.component.html',
  styleUrls: ['./montee-eaux.component.scss', '../detailscontent.component.scss'],
})
export class MonteeEauxComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
