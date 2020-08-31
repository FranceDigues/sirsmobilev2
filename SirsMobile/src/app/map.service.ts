import { Injectable } from '@angular/core';
// import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
// import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import WKT from 'ol/format/WKT';
// import * as olSphere from 'ol/sphere';
// import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

import { transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';

import LineString from 'ol/geom/LineString';

import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';
import { SirsDocService } from './sirsdoc.service';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { RealPositionStyle } from './style.service';
import { LocalDatabase } from './usingLocalDatabase.service';
import { DatabaseService } from './database.service';
import { DatabaseModel } from './models/database.model';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    // wgs84Sphere = new olSphere(6378137); // ? mb useful
    // selectInteraction = new Select({
        //     style: new Style({
            //         fill: new Fill({ color: [255, 255, 255, 0.5] })
    //     }),
    //     layers: (olLayer) => {
    //         const model = olLayer.get('model');
    //         if (typeof model === 'object') {
    //             return model.selectable === true && model.visible === true // && appLayers.getVisible // TODO
    //         }
    //         return olLayer.get('name') === 'Edition' // && editionLayer.getVisible // TODO
    //     }
    // })

    currentView = null;
    constructor(private dbService: DatabaseService) {

        this.currentView = this.getCurrentView();
    }
    public selection = {
        list: [],
        active: null
    }
    public archiveObjectsFlag: boolean = false;

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
    }

    // buildMap(element): Map {
    //     if (!this.currentView.get('touched')) { // ? interresting
    //         this.localDB.get('$sirs')
    //         .then(
    //             (result) => {
    //                 if (result.envelope) {
    //                     const geometry = new WKT().readGeometry(result.geometry, {
    //                         dataProjection: 'EPSG:2154',
    //                         featureProjection: 'EPSG:3857'
    //                     });
    //                     this.currentView.fit(geometry, [element.width(), element.height()]);
    //                     this.currentView.set('touched', true);
    //                 }
    //             }
    //         )
    //     }

    //     return {
    //         target: 'map',
    //         view: this.currentView,
    //         layers: [this.backLayers, this.appLayers, this.editionLayer, this.geolocLayer],
    //         control: [],
    //         interactions: defaults({
    //             pinchRotate: false,
    //             altShiftDragRotate: false,
    //             ShiftDragZoom: false
    //         }).extends(this.selectInteraction),
    //     }
    // }


}
