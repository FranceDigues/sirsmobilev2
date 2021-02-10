import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-chemin-acces-dependance',
  templateUrl: './chemin-acces-dependance.component.html',
  styleUrls: ['./chemin-acces-dependance.component.scss', '../detailscontent.component.scss'],
})
export class CheminAccesDependanceComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
