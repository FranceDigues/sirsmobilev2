import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-reseau-hydraulique-ferme',
  templateUrl: './reseau-hydraulique-ferme.component.html',
  styleUrls: ['./reseau-hydraulique-ferme.component.scss', '../detailscontent.component.scss'],
})
export class ReseauHydrauliqueFermeComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
