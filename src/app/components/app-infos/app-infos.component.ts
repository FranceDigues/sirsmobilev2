import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppVersionsService } from 'src/app/services/app-versions.service';

@Component({
    selector: 'app-infos',
    templateUrl: './app-infos.component.html',
    styleUrls: ['./app-infos.component.scss'],
})
export class AppInfosComponent implements OnInit {

    versionsObject = {};

    @Output() readonly slidePathChange = new EventEmitter<string>();

    constructor(private appVersions: AppVersionsService) {
    }

    ngOnInit() {
        this.versionsObject = this.appVersions.getVersions();
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

}
