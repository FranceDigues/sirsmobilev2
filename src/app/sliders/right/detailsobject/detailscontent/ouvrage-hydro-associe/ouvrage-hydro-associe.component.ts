import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouvrage-hydro-associe',
  templateUrl: './ouvrage-hydro-associe.component.html',
  styleUrls: ['./ouvrage-hydro-associe.component.scss', '../detailscontent.component.scss'],
})
export class OuvrageHydroAssocieComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
