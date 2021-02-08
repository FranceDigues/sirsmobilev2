import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-echelle-limnimetrique',
  templateUrl: './echelle-limnimetrique.component.html',
  styleUrls: ['./echelle-limnimetrique.component.scss', '../detailscontent.component.scss'],
})
export class EchelleLimnimetriqueComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
