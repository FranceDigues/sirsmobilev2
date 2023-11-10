import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../database-connection/models/database.model';
import { SirsDataService } from "../../../services/sirs-data.service";
import { Contact } from "../../../shared/models/contact.model";
import { ArraySortPipe2 } from "../../object-details/observation-edit/observation-edit.component";
import { Memoize } from "typescript-memoize";
import { ObservationEditService } from "../../../services/observation-edit.service";

@Component({
    selector: 'app-settings',
    templateUrl: './app-settings.component.html',
    styleUrls: ['./app-settings.component.scss'],
})
export class AppSettingsComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();
    public showTextConfig?: string;
    public defaultObservateurId?: string;
    public contactList?: {doc: Contact, id: string, key: any, value: any}[];
    private _prefillObservations?: boolean;

    constructor(private databaseService: DatabaseService,
                private sirsDataService: SirsDataService,
                private observationEditService: ObservationEditService,
                private sortByDocNomPipe: ArraySortPipe2) {
    }

    ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.showTextConfig = config.context.showText;
                this.defaultObservateurId = config.context.defaultObservateurId;
            });

        this.sirsDataService.getContactList().then((list: {doc: Contact, id: string, key: any, value: any}[]) => {
            this.contactList = this.sortByDocNomPipe.transform(list);
        }, (error) => {
            console.error('error contactList returned : ', error);
        });

        this.observationEditService.getPrefillObservation().then(prefill => this._prefillObservations = prefill);
    }

    public get prefillObservations(): boolean | undefined {
        return this._prefillObservations;
    }

    public set prefillObservations(value: boolean) {
        this._prefillObservations = value;
        this.observationEditService.setPrefillObservation(value).then();
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

    @Memoize()
    parseContactName(observateur) {
        return observateur.doc.nom ? `${observateur.doc.nom} ${observateur.doc.prenom ? observateur.doc.prenom : ''}` : observateur.doc.designation;
    }

}
