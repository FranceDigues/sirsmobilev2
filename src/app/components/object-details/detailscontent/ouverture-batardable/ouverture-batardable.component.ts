import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouverture-batardable',
  templateUrl: './ouverture-batardable.component.html',
  styleUrls: ['./ouverture-batardable.component.scss', '../detailscontent.component.scss'],
})
export class OuvertureBatardableComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
