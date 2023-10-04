import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-aire-stockage-dependance',
  templateUrl: './aire-stockage-dependance.component.html',
  styleUrls: ['./aire-stockage-dependance.component.scss', '../detailscontent.component.scss'],
})
export class AireStockageDependanceComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
