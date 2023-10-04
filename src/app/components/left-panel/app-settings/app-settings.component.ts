import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../database-connection/models/database.model';
import { SirsDataService } from "../../../services/sirs-data.service";

@Component({
    selector: 'app-settings',
    templateUrl: './app-settings.component.html',
    styleUrls: ['./app-settings.component.scss'],
})
export class AppSettingsComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();
    public showTextConfig;
    public defaultObservateurId;
    public contactList;

    get touchSensitivity() {
        return +localStorage.getItem('touchSensitivity') || 200;
    }

    set touchSensitivity(value: number) {
        localStorage.setItem('touchSensitivity', value.toString());
    }

    constructor(private databaseService: DatabaseService,
                public sirsDataService: SirsDataService) {
    }

    ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.showTextConfig = config.context.showText;
                this.defaultObservateurId = config.context.defaultObservateurId;
            });

        this.sirsDataService.getContactList().then((list) => {
            this.contactList = list;
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

    parseContactName(observateur) {
        return observateur.doc.nom ? `${observateur.doc.nom} ${observateur.doc.prenom ? observateur.doc.prenom : ''}` : observateur.doc.designation;
    }

}
