import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouvrage-telecom-energie',
  templateUrl: './ouvrage-telecom-energie.component.html',
  styleUrls: ['./ouvrage-telecom-energie.component.scss', '../detailscontent.component.scss'],
})
export class OuvrageTelecomEnergieComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
