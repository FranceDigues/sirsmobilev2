import { Injectable } from '@angular/core';
import { transform } from 'ol/proj';
import View from 'ol/View';
import { DatabaseService } from './database.service';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    _currentView = null;
    constructor(private dbService: DatabaseService) {}

    public selection = {
        list: [],
        active: null
    };
    public archiveObjectsFlag = false;

    getCurrentView() {
        if (!this._currentView) {
            const isCurrentView = this.dbService.activeDB.context.currentView;
            if (isCurrentView) {
                return new View({
                    zoom: isCurrentView.zoom,
                    center: isCurrentView.coords,
                    enableRotation: false
                });
            } else {
                return new View({
                    zoom: 6,
                    center: transform([2.7246, 47.0874], 'EPSG:4326', 'EPSG:3857'),
                    enableRotation: false
                });
            }
        }
        return this._currentView;
    }

    get currentView(): View {
        return this.getCurrentView();
    }


}
