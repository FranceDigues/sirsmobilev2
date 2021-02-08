import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-reseau-hydraulique-ciel-ouvert',
  templateUrl: './reseau-hydraulique-ciel-ouvert.component.html',
  styleUrls: ['./reseau-hydraulique-ciel-ouvert.component.scss', '../detailscontent.component.scss'],
})
export class ReseauHydrauliqueCielOuvertComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
