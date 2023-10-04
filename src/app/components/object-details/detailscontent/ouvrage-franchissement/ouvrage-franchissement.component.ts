import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-ouvrage-franchissement',
  templateUrl: './ouvrage-franchissement.component.html',
  styleUrls: ['./ouvrage-franchissement.component.scss', '../detailscontent.component.scss'],
})
export class OuvrageFranchissementComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
