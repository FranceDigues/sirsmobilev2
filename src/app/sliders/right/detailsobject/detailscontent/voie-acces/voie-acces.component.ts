import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-voie-acces',
  templateUrl: './voie-acces.component.html',
  styleUrls: ['./voie-acces.component.scss', '../detailscontent.component.scss'],
})
export class VoieAccesComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
