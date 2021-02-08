import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-voie-digue',
  templateUrl: './voie-digue.component.html',
  styleUrls: ['./voie-digue.component.scss', '../detailscontent.component.scss'],
})
export class VoieDigueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
