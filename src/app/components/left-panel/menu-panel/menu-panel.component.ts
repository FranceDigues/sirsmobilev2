import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {MapManagerService} from 'src/app/services/map-manager.service';
import {MapService} from 'src/app/services/map.service';
import {EditionLayerService} from '../../../services/edition-layer.service';
import {DatabaseService} from '../../../services/database.service';

@Component({
    selector: 'menu-panel',
    templateUrl: './menu-panel.component.html',
    styleUrls: ['./menu-panel.component.scss'],
})
export class MenuPanelComponent implements OnInit {
    public editionFlag;

    @Output() readonly slidePathChange = new EventEmitter<string>();

    constructor(public editionLayerService: EditionLayerService, public geolocationService: GeolocationService,
                private databaseService: DatabaseService,
                public mapService: MapService, private mapManagerService: MapManagerService, private route: Router) {
    }

    ngOnInit() {
        this.editionLayerService.isEnabled().then(state => {
            this.editionFlag = state;
        });
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

    goSuperficialLayers() {
        this.slidePathChange.emit('shapeLayerManager');
    }

    goGallery() {
        this.route.navigateByUrl('/gallery');
    }

    goSynchronisation() {
        this.route.navigateByUrl('/sync');
    }

    changeEditionMode() {
        this.editionFlag = !this.editionFlag;
        // Hide or show the edition layer
        this.editionLayerService.changeVisibility(this.editionFlag);
        this.databaseService.changeEditionModeFlag(this.editionFlag);
    }

    changeLocationGPS() {
        this.geolocationService.isEnabled = !this.geolocationService.isEnabled;
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
