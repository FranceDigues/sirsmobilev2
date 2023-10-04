import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-troncon-digue',
  templateUrl: './troncon-digue.component.html',
  styleUrls: ['./troncon-digue.component.scss', '../detailscontent.component.scss'],
})
export class TronconDigueComponent {

  @Input() activeTab: 'description' | 'photos';

  constructor(public detailsObject: ObjectDetails) { }

}
