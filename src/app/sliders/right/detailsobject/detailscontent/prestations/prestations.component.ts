import { Component } from '@angular/core';
import { ObjectDetails } from 'src/app/objectdetails.service';

@Component({
  selector: 'prestations-generic',
  templateUrl: './prestations.component.html',
  styleUrls: ['./prestations.component.scss', '../detailscontent.component.scss'],
})
export class PrestationsGenericComponent {

  constructor(public detailsObject: ObjectDetails) { }

}
