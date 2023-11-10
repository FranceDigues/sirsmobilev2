import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../database-connection/models/database.model';
import { SirsDataService } from "../../../services/sirs-data.service";
import { Contact } from "../../../shared/models/contact.model";
import { ArraySortPipe2 } from "../../object-details/observation-edit/observation-edit.component";
import { Memoize } from "typescript-memoize";

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

    constructor(private databaseService: DatabaseService,
                public sirsDataService: SirsDataService,
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
