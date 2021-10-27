import { Component, Input } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'app-organe-protection-collective',
  templateUrl: './organe-protection-collective.component.html',
  styleUrls: ['./organe-protection-collective.component.scss'],
})
export class OrganeProtectionCollectiveComponent {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor(public detailsObject: ObjectDetails) { }

}
