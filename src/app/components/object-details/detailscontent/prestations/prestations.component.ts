import { Component, OnInit } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { Memoize, clear as memoizeClear } from "typescript-memoize";
import { DatabaseService } from "../../../../services/database.service";
import { MapService } from "../../../../services/map.service";

@Component({
  selector: 'prestations-generic',
  templateUrl: './prestations.component.html',
  styleUrls: ['./prestations.component.scss', '../detailscontent.component.scss'],
})
export class PrestationsGenericComponent implements OnInit {

  public prestationList: any[] = [];
  public degradationPrestations: any[] = [];
  public textConfig: 'abstract' | 'fullName' | 'both' | undefined;

  constructor(public detailsObject: ObjectDetails,
              public databaseService: DatabaseService,
              public mapService: MapService) {}

  ngOnInit() {
    this.getCurrentTextConfig().then(cfg => {
      this.textConfig = cfg;
      memoizeClear(['prestationDisplayName']);
    });
    this.reloadLists();
  }

  private async getCurrentTextConfig(): Promise<'abstract' | 'fullName' | 'both'> {
    const config: any = await this.databaseService.getCurrentDatabaseSettings();
    return config.context.showText;
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

  /**
   * This function returns a human-readable name for a given 'prestation'
   * depending on the current 'textConfig' setting.
   *
   * @param prestation {object} - The prestation that we want to be human-readable
   * @return {string} - The generated name or an empty string if wrong configuration is provided.
   */
  @Memoize({
    hashFunction: (p) => (p ? p.id : 'undefined'),
    tags: ['prestationDisplayName']
  })
  public prestationDisplayName(prestation: any): string {
    // Return an empty string if 'prestation' is undefined
    if (!prestation) return '';

    let displayName = '';

    switch (this.textConfig) {
      case 'abstract':
        displayName = prestation.designation || 'Sans désignation';
        break;
      case 'fullName':
        displayName = prestation.libelle || 'Sans libellé';
        break;
      case 'both':
        const designation = prestation.designation || 'Sans désignation';
        const libelle = prestation.libelle || 'Sans libellé';
        displayName = `${designation} - ${libelle}`;
        break;
      default:
        // Return an empty string if 'textConfig' is undefined or doesn't match any expected value
        return '';
    }

    return displayName;
  }

  public getPrestationsFromId(id: string): any | undefined {
    const idx: number = this.detailsObject.allPrestationList.findIndex(el => el.id === id);
    if (idx === -1) {
      return undefined;
    } else {
      return this.detailsObject.allPrestationList[idx];
    }
  }

  /**
   * returns all the prestations that should be displayed
   */
  filteredPrestationList() {
    if (this.mapService.archiveObjectsFlag) {
      return [...this.detailsObject.prestationList];
    } else {
      return [...this.detailsObject.prestationList].filter(p => !p.prestationFinished);
    }
  }

}
