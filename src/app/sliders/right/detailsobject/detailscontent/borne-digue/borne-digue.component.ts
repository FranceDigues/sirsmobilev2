import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-borne-digue',
  templateUrl: './borne-digue.component.html',
  styleUrls: ['./borne-digue.component.scss', '../detailscontent.component.scss'],
})
export class BorneDigueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
