import { Component, Input, OnInit } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-amenagement-hydraulique',
  templateUrl: './amenagement-hydraulique.component.html',
  styleUrls: ['./amenagement-hydraulique.component.scss', '../detailscontent.component.scss'],
})
export class AmenagementHydrauliqueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
