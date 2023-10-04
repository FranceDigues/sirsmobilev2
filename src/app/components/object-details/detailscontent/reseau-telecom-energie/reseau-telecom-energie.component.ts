import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-reseau-telecom-energie',
  templateUrl: './reseau-telecom-energie.component.html',
  styleUrls: ['./reseau-telecom-energie.component.scss', '../detailscontent.component.scss'],
})
export class ReseauTelecomEnergieComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
