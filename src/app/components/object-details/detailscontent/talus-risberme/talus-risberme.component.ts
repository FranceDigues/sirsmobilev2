import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-talus-risberme',
  templateUrl: './talus-risberme.component.html',
  styleUrls: ['./talus-risberme.component.scss', '../detailscontent.component.scss'],
})
export class TalusRisbermeComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
