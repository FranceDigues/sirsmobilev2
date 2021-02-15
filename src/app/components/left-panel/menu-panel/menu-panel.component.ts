import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { MapManagerService, EditionLayer } from 'src/app/services/map-manager.service';
import { MapService } from 'src/app/services/map.service';

@Component({
    selector: 'menu-panel',
    templateUrl: './menu-panel.component.html',
    styleUrls: ['./menu-panel.component.scss'],
})
export class MenuPanelComponent implements OnInit {

    @Output() readonly slidePathChange = new EventEmitter<string>();

    constructor(public editionLayer: EditionLayer, public geoloc: GeolocationService,
                public mapService: MapService, private mapManagerService: MapManagerService, private route: Router) {
    }

    ngOnInit() {
    }

    goCraftLayers() {
        this.slidePathChange.emit('craftLayers');
    }

    goChoiceOfSectionsDigues() {
        this.slidePathChange.emit('choiceOfSectionsDigues');
    }

    goBackMap() {
        this.slidePathChange.emit('backMap');
    }

    goGallery() {
        this.route.navigateByUrl('/gallery');
    }

    goSynchronisation() {
        this.route.navigateByUrl('/sync');
    }

    changeEditionMode() {
        const tmp = this.editionLayer.editionLayer.getVisible();
        this.editionLayer.editionLayer.setVisible(!tmp);
    }

    changeLocationGPS() {
        this.geoloc.enableGeoloc = !this.geoloc.enableGeoloc;
    }

    changeShowArchivedObjects() {
        this.mapService.archiveObjectsFlag = !this.mapService.archiveObjectsFlag;
        this.mapManagerService.syncAllAppLayer();
    }

    goAppInfos() {
        this.slidePathChange.emit('appInfos');
    }

    goAppSettings() {
        this.slidePathChange.emit('appSettings');
    }

}
