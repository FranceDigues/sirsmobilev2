import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-talus-digue',
  templateUrl: './talus-digue.component.html',
  styleUrls: ['./talus-digue.component.scss', '../detailscontent.component.scss'],
})
export class TalusDigueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
