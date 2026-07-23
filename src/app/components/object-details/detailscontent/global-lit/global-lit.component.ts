import {Component, Input, OnInit} from '@angular/core';
import {ObjectDetails} from "../../../../services/object-details.service";
import {LocalDatabase} from "../../../../services/local-database.service";

@Component({
  selector: 'object-details-content-global-lit',
  templateUrl: './global-lit.component.html',
  styleUrls: ['./global-lit.component.scss','../detailscontent.component.scss'],
})
export class GlobalLitComponent implements OnInit {
  @Input() activeTab: 'description';
  public showBorneRelativePosition: boolean = false;
  public borneDebutPositionStr?: string;
  public borneFinPositionStr?: string;

  public isLinear: boolean;

  constructor(
      public detailsObject: ObjectDetails,
      private localDB: LocalDatabase,
  ) {
    console.log("dans le constructeur: ",detailsObject.selectedObject)
    this.isLinear = this.isDegradationLinear();

    this.detailsObject.getShowBorneRelativePosition().then((show) => {
      this.showBorneRelativePosition = show;
    });

    Promise.all([this.getBornePosition('debut'), this.getBornePosition('fin')]).then(([debutStr, finStr]) => {
      this.borneDebutPositionStr = debutStr;
      this.borneFinPositionStr = finStr;
    });
  }

  /**
   * Retrieves the position of a given "pos" parameter.
   *
   * @param {('debut' | 'fin')} pos - The position parameter, either 'debut' or 'fin'.
   *
   * @returns {Promise<string>} The position of the given parameter.
   */
  private async getBornePosition(pos: 'debut' | 'fin'): Promise<string> {
    const propBorneId = pos === 'debut' ? 'borneDebutId' : 'borneFinId';
    const propBorneDistance = pos === 'debut' ? 'borne_debut_distance' : 'borne_fin_distance';
    const propBorneAval = pos === 'debut' ? 'borne_debut_aval' : 'borne_fin_aval';

    if (!this.detailsObject.selectedObject[propBorneId]) {
      return 'à définir';
    }

    const borneName: string = await this.retrieveBorneName(this.detailsObject.selectedObject[propBorneId]);
    return `à ${Math.round(this.detailsObject.selectedObject[propBorneDistance])} m en ${(this.detailsObject.selectedObject[propBorneAval] ? 'amont' : 'aval')} de la borne ${borneName}`;
  }

  /**
   * Retrieves the name of a borne.
   *
   * @param {string} id - The ID of the borne.
   * @return {Promise<string>} - The name of the borne.
   */
  private async retrieveBorneName(id: string): Promise<string> {
    const borne = await this.localDB.get(id);
    return !borne.libelle ? borne.designation : borne.libelle;
  }

  /**
   * Checks if the degradation is linear.
   *
   * @return {boolean} - Returns true if the degradation is linear, false otherwise.
   */
  private isDegradationLinear(): boolean {
    const objectDoc = this.detailsObject.selectedObject
    if (objectDoc.positionDebut && objectDoc.positionFin && objectDoc.positionDebut === objectDoc.positionFin) {
      return false;
    } else return !(objectDoc.borneDebutId && objectDoc.borneFinId
        && (objectDoc.borneDebutId === objectDoc.borneFinId
            || objectDoc.borne_debut_aval === objectDoc.borne_fin_aval
            || objectDoc.borne_debut_distance === objectDoc.borne_fin_distance));
  }

  ngOnInit(): void {
  }

}
