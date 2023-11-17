import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { DatabaseService } from "../../../../services/database.service";
import { ToastService } from "../../../../services/toast.service";
import { ToastNotification } from "../../../../shared/models/toast-notification.model";

@Component({
  selector: 'vegetation-details',
  templateUrl: './vegetation-details.component.html',
  styleUrls: ['./vegetation-details.component.scss', '../detailscontent.component.scss'],
})
export class VegetationDetailsComponent implements OnInit {
  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';
  @Input() objectType: string;
  public descLoading: boolean = true;
  public parcelle: any;
  public typePosition: any;
  public typeCote: any;
  public etatSanitaire: any;
  public hauteurVegetation: any;
  public diametreVegetation: any;
  public densiteVegetation: any;


  constructor(
      public detailsObject: ObjectDetails,
      private databaseService: DatabaseService,
      private changeDetectorRef: ChangeDetectorRef,
      private toastService: ToastService,
  )
  {}

  public ngOnInit(): void {
    this.init().then(() => {
      this.descLoading = false;
      this.changeDetectorRef.markForCheck();
    }).catch(e => {
      this.toastService.show(new ToastNotification('Erreur lors de la récupération des données', 3000));
      console.error(e);
    });
  }

  private async init(): Promise<void> {
    const promises: Promise<any>[] = [
      this.getById(this.detailsObject.selectedObject.parcelleId),
      this.getById(this.detailsObject.selectedObject.typePositionId),
      this.getById(this.detailsObject.selectedObject.typeCoteId),
      this.getById(this.detailsObject.selectedObject.etatSanitaireId),
      this.getById(this.detailsObject.selectedObject.hauteurId),
      this.getById(this.detailsObject.selectedObject.diametreId),
      this.getById(this.detailsObject.selectedObject.densiteId),
    ];

    const results: any[] = await Promise.all(promises);

    this.parcelle = results[0];
    this.typePosition = results[1];
    this.typeCote = results[2];
    this.etatSanitaire = results[3];
    this.hauteurVegetation = results[4];
    this.diametreVegetation = results[5];
    this.densiteVegetation = results[6];
  }

  private async getById(id: string | undefined): Promise<any> {
    if (id === undefined) return undefined;
    const results = await this.databaseService.getLocalDB().query('byId', { key: id });
    return results.rows[0].value;
  }

}
