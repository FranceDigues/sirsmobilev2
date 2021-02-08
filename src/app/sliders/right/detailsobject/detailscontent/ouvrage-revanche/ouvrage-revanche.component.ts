import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouvrage-revanche',
  templateUrl: './ouvrage-revanche.component.html',
  styleUrls: ['./ouvrage-revanche.component.scss', '../detailscontent.component.scss'],
})
export class OuvrageRevancheComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
