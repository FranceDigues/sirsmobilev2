import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouvrage-particulier',
  templateUrl: './ouvrage-particulier.component.html',
  styleUrls: ['./ouvrage-particulier.component.scss', '../detailscontent.component.scss'],
})
export class OuvrageParticulierComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
