import { Injectable } from '@angular/core';
import { transform } from 'ol/proj';
import View from 'ol/View';
import { DatabaseService } from './database.service';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    currentView = null;
    constructor(private dbService: DatabaseService) {

        this.currentView = this.getCurrentView();
    }
    public selection = {
        list: [],
        active: null
    };
    public archiveObjectsFlag = false;

    getCurrentView() {
        if (!this.currentView) {
            console.log('r y srs', this.dbService.activeDB);
            const isCurrentView = this.dbService.activeDB.context.currentView;
            if (isCurrentView) {
                console.log('the new last view');
                return new View({
                    zoom: isCurrentView.zoom,
                    center: isCurrentView.coords,
                    enableRotation: false
                });
            } else {
                console.log('the default view');
                return new View({
                    zoom: 6,
                    center: transform([2.7246, 47.0874], 'EPSG:4326', 'EPSG:3857'),
                    enableRotation: false
                });
            }
        }
        // ? missing return here (not need but only to return something if the condition is false)
    }


}
