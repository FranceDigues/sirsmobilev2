import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'app-prestation-amenagement-hydraulique',
  templateUrl: './prestation-amenagement-hydraulique.component.html',
  styleUrls: ['./prestation-amenagement-hydraulique.component.scss'],
})
export class PrestationAmenagementHydrauliqueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
