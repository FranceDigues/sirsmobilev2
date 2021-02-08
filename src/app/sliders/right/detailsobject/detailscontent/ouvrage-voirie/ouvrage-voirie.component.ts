import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouvrage-voirie',
  templateUrl: './ouvrage-voirie.component.html',
  styleUrls: ['./ouvrage-voirie.component.scss', '../detailscontent.component.scss'],
})
export class OuvrageVoirieComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
