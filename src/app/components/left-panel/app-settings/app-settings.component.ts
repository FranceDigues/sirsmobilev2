import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../database-connection/models/database.model';
import { SirsDataService } from "../../../services/sirs-data.service";
import { Contact } from "../../../shared/models/contact.model";
import { Prestation } from "../../../shared/models/prestation.model";
import { ArraySortPipe2 } from "../../object-details/observation-edit/observation-edit.component";
import { Memoize } from "typescript-memoize";
import { ObservationEditService } from "../../../services/observation-edit.service";
import { ObjectDetails } from "../../../services/object-details.service";
import { PrestationsGenericComponent } from '../../object-details/detailscontent/prestations/prestations.component';
import { GetByIdPipe } from 'src/app/pipe/get-by-id/get-by-id.pipe';
import { MapService } from 'src/app/services/map.service';
import { EditObjectService } from 'src/app/services/edit-object.service';



@Component({
    selector: 'app-settings',
    templateUrl: './app-settings.component.html',
    styleUrls: ['./app-settings.component.scss'],
})
export class AppSettingsComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();
    public showTextConfig?: string;
    public defaultObservateurId?: string;
    public defaultPrestationId?: string;
    public contactList?: {doc: Contact, id: string, key: any, value: any}[];
    public prestationList?: any;
    private _prefillObservations?: boolean;
    private _showBorneDistance?: boolean;

    constructor(private databaseService: DatabaseService,
                private sirsDataService: SirsDataService,
                private observationEditService: ObservationEditService,
                private detailService: ObjectDetails,
                public detailsObject: ObjectDetails,
                private getByIdPipe: GetByIdPipe,
                private mapService: MapService,
                private sortByDocNomPipe: ArraySortPipe2,
                private EOS : EditObjectService
            ) {                
    }       

    async ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.showTextConfig = config.context.showText;
                this.defaultObservateurId = config.context.defaultObservateurId;
                this.defaultPrestationId =  config.context.defaultPrestationId;
            });

        this.sirsDataService.getContactList().then((list: {doc: Contact, id: string, key: any, value: any}[]) => {
            this.contactList = this.sortByDocNomPipe.transform(list);
        }, (error) => {
            console.error('error contactList returned : ', error);
        });

        this.observationEditService.getPrefillObservation().then(prefill => this._prefillObservations = prefill);
        this.detailService.getShowBorneRelativePosition().then(show => this._showBorneDistance = show); 
        this.sirsDataService.getPrestationList().then(async (list: {doc: Prestation, id: string, key: any, value: any}[]) => {
            if (this.mapService.archiveObjectsFlag) {
                this.prestationList = this.sortByDocNomPipe.transformPrestation(list);
            } else {
                this.prestationList = this.sortByDocNomPipe.transformPrestation(list.filter(p => !p.doc.date_fin));
            }
            await this.EOS.initTronconList()
            const idTroncon = this.EOS.troncons.map(item => item.id);
            const resultatFiltre = this.prestationList.filter(item => idTroncon.includes(item.doc.linearId));
    
            this.prestationList  = resultatFiltre;
        }, (error) => {
            console.error('error contactList returned : ', error);
        });     
    }
    
    public get prefillObservations(): boolean | undefined {
        return this._prefillObservations;
    }

    public set prefillObservations(value: boolean) {
        this._prefillObservations = value;
        this.observationEditService.setPrefillObservation(value).then();
    }

    public get showBorneDistance(): boolean | undefined {
        return this._showBorneDistance;
    }

    public set showBorneDistance(value: boolean) {
        this._showBorneDistance = value;
        this.detailService.setShowBorneRelativePosition(value).then();
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    changeShowTextConfig(value: string) {
        this.databaseService.changeShowTextConfig(value);
    }

    changeDefaultObservateurId() {
        this.databaseService
            .changeDefaultObservateurId(this.defaultObservateurId);
    }

    changeDefaultPrestationId(){
        this.databaseService.changeDefaultPrestationId(this.defaultPrestationId);
    }
    @Memoize()
    parseContactName(observateur) {
        return observateur.doc.nom ? `${observateur.doc.nom} ${observateur.doc.prenom ? observateur.doc.prenom : ''}` : observateur.doc.designation;
    }

}
