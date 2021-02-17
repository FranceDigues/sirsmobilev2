import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../database-connection/models/database.model';

@Component({
    selector: 'app-settings',
    templateUrl: './app-settings.component.html',
    styleUrls: ['./app-settings.component.scss'],
})
export class AppSettingsComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();
    public showTextConfig;

    constructor(private databaseService: DatabaseService) {
    }

    ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.showTextConfig = config.settings.showText;
            });
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    changeShowTextConfig(value: string) {
        this.databaseService.changeShowTextConfig(value);
    }

}
