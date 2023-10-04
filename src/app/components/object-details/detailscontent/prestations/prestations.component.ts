import { Component, OnInit } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';

@Component({
  selector: 'prestations-generic',
  templateUrl: './prestations.component.html',
  styleUrls: ['./prestations.component.scss', '../detailscontent.component.scss'],
})
export class PrestationsGenericComponent implements OnInit {

  public prestationList: any[] = [];

  constructor(public detailsObject: ObjectDetails) {
  }

  ngOnInit() {
    this.filteredPrestationList();
  }

  filteredPrestationList() {
    const prestationList = this.detailsObject.prestationList;
    if (prestationList) {
      for (let i = 0; i < prestationList.length; i++) {
        if (!prestationList[i].libelle && !prestationList[i].designation) {
          prestationList.splice(i, 1);
        } else {
          for (let x = 0; x < prestationList.length; x++) {
            if (prestationList[i] && prestationList[x]) {
              if (prestationList[i].designation == prestationList[x].designation && i != x) {
                prestationList.splice(x, 1);
              }
            }
          }
        }
      }
    }
    this.prestationList = prestationList;
  }

}
