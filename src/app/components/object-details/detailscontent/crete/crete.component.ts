import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'object-details-content-crete',
  templateUrl: './crete.component.html',
  styleUrls: ['./crete.component.scss', '../detailscontent.component.scss'],
})
export class CreteComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
