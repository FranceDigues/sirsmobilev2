import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-trait-amenagement-hydraulique',
  templateUrl: './trait-amenagement-hydraulique.component.html',
  styleUrls: ['./trait-amenagement-hydraulique.component.scss', '../detailscontent.component.scss'],
})
export class TraitAmenagementHydrauliqueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
