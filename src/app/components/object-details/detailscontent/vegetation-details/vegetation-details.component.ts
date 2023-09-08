import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'vegetation-details',
  templateUrl: './vegetation-details.component.html',
  styleUrls: ['./vegetation-details.component.scss', '../detailscontent.component.scss'],
})
export class VegetationDetailsComponent {
  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';
  @Input() objectType: string;

  constructor(public detailsObject: ObjectDetails) {

  }

}
