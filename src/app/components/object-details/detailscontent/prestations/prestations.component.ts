import { Component, OnInit } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { Memoize } from "typescript-memoize";

@Component({
  selector: 'prestations-generic',
  templateUrl: './prestations.component.html',
  styleUrls: ['./prestations.component.scss', '../detailscontent.component.scss'],
})
export class PrestationsGenericComponent implements OnInit {

  public prestationList: any[] = [];
  public degradationPrestations: any[] = [];

  constructor(public detailsObject: ObjectDetails) {}

  ngOnInit() {
    this.reloadLists();
  }

  public reloadLists(): void {
    this.prestationList = this.filteredPrestationList();
    if (this.detailsObject.selectedObject.prestationIds) {
      this.degradationPrestations = this.detailsObject.selectedObject.prestationIds.map((id: string) => this.getPrestationsFromId(id));
    } else {
      this.degradationPrestations = [];
    }
  }

  public async addPrestation(): Promise<void> {
    await this.detailsObject.addPrestation();
    this.reloadLists();
  }

  public async removePrestation(prestation: any): Promise<void> {
    const idx: number = this.degradationPrestations.indexOf(prestation);
    await this.detailsObject.removePrestation(idx);
    this.reloadLists();
  }

  @Memoize((p) => p.id)
  public prestationDisplayName(prestation: any): string {
    console.assert(!!prestation, 'Cannot calculate displayname of ', prestation);
    let res = '';

    if (prestation.designation) {
      res += prestation.designation;
    } else {
      res += 'Sans désignation';
    }

    res += ' - ';

    if (prestation.libelle) {
      res += prestation.libelle;
    } else {
      res += 'Sans libellé';
    }

    res += ' - ';

    res += prestation.id;

    return res;
  }

  public getPrestationsFromId(id: string): any | undefined {
    const idx: number = this.detailsObject.allPrestationList.findIndex(el => el.id === id);
    if (idx === -1) {
      return undefined;
    } else {
      return this.detailsObject.allPrestationList[idx];
    }
  }

  filteredPrestationList() {
    return [...this.detailsObject.prestationList].filter(p => !p.prestationFinished)
  }

}
