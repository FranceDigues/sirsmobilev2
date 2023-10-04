import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-laisse-crue',
  templateUrl: './laisse-crue.component.html',
  styleUrls: ['./laisse-crue.component.scss', '../detailscontent.component.scss'],
})
export class LaisseCrueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
