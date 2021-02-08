import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-autre-dependance',
  templateUrl: './autre-dependance.component.html',
  styleUrls: ['./autre-dependance.component.scss', '../detailscontent.component.scss'],
})
export class AutreDependanceComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
