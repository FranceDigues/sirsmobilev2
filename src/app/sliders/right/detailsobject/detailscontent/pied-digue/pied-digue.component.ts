import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-pied-digue',
  templateUrl: './pied-digue.component.html',
  styleUrls: ['./pied-digue.component.scss', '../detailscontent.component.scss'],
})
export class PiedDigueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
