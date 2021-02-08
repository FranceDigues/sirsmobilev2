import { Component } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'desordres-generic',
  templateUrl: './desordres.component.html',
  styleUrls: ['./desordres.component.scss', '../detailscontent.component.scss'],
})
export class DesordresGenericComponent {

  constructor(public detailsObject: ObjectDetails) { }

}
