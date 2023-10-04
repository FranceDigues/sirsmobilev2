import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-prestation',
  templateUrl: './prestation.component.html',
  styleUrls: ['./prestation.component.scss', '../detailscontent.component.scss'],
})
export class PrestationComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
