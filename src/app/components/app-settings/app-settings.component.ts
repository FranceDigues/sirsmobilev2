import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

@Component({
    selector: 'app-settings',
    templateUrl: './app-settings.component.html',
    styleUrls: ['./app-settings.component.scss'],
})
export class AppSettingsComponent implements OnInit {

    @Output() readonly slidePathChange = new EventEmitter<string>();

    constructor(private globalConfig: ConfigService) {
    }

    ngOnInit() {
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    updateGlobalConfig(state) {
        this.globalConfig.updateValue(state);
        console.log('updatedState:', state);
    }

    getGlobalConfig() {
        return this.globalConfig.getValue();
    }

}
