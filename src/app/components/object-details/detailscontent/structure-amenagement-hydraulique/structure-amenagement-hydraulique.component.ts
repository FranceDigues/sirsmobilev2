import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'app-structure-amenagement-hydraulique',
  templateUrl: './structure-amenagement-hydraulique.component.html',
  styleUrls: ['./structure-amenagement-hydraulique.component.scss'],
})
export class StructureAmenagementHydrauliqueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
