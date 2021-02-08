import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-station-pompage',
  templateUrl: './station-pompage.component.html',
  styleUrls: ['./station-pompage.component.scss', '../detailscontent.component.scss'],
})
export class StationPompageComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
