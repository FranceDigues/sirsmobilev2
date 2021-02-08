import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouvrage-voirie-dependance',
  templateUrl: './ouvrage-voirie-dependance.component.html',
  styleUrls: ['./ouvrage-voirie-dependance.component.scss', '../detailscontent.component.scss'],
})
export class OuvrageVoirieDependanceComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
