import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-desordre',
  templateUrl: './desordre.component.html',
  styleUrls: ['./desordre.component.scss', '../detailscontent.component.scss'],
})
export class DesordreComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) {

  }

}
