import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-sommet-risberne',
  templateUrl: './sommet-risberne.component.html',
  styleUrls: ['./sommet-risberne.component.scss', '../detailscontent.component.scss'],
})
export class SommetRisberneComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
