import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-largeur-franc-bord',
  templateUrl: './largeur-franc-bord.component.html',
  styleUrls: ['./largeur-franc-bord.component.scss', '../detailscontent.component.scss'],
})
export class LargeurFrancBordComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
