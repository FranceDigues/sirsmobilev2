import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'app-ouvrage-associe-amenagement-hydraulique',
  templateUrl: './ouvrage-associe-amenagement-hydraulique.component.html',
  styleUrls: ['./ouvrage-associe-amenagement-hydraulique.component.scss'],
})
export class OuvrageAssocieAmenagementHydrauliqueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
