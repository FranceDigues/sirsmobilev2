import { Component, OnInit } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'observations-generic',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss', '../detailscontent.component.scss'],
})
export class ObservationsGenericComponent {

  constructor(public detailsObject: ObjectDetails) { }

}
