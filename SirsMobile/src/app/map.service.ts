import { Injectable } from '@angular/core';
// import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
// import TileLayer from 'ol/layer/Tile';
// import View from 'ol/View';
// import WKT from 'ol/format/WKT';
// import * as olSphere from 'ol/sphere';
// import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import VectorSource from 'ol/source/Vector';
// import * as transform from 'ol/proj';
// import { LocalDatabase } from './usingLocalDatabase.service';
// import { defaults } from 'ol/interaction';
// import Select from 'ol/interaction/Select';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    // currentView = new View({
    //     zoom: 6,
    //     center: transform([[2.7246, 47.0874], 'EPSG:4326', 'EPSG:3857']),
    //     enableRotation: false
    // });
    // selection = {
    //     list: [],
    //     active: null
    // }
    // wktFormat = new WKT();
    // wgs84Sphere = new olSphere(6378137);
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
    // backLayers = new LayerGroup({
    //     name: 'Background',
    //     layers: [
    //         // createBackLayerInstance(BackLayerService.getActive) // TODO
    //     ]
    // })
    // appLayers = new LayerGroup({
    //     name: 'Objects',
    //     // layers: AppLayersService.getFavorites().map(createAppLayerInstance) // TODO
    // })
    // editionLayer = null // = createEditionLayerInstance(); // TODO
    geolocLayer = new VectorLayer({
        name: 'Geolocation',
        visible: true,
        source: new VectorSource({ useSpatialIndex: false }),
        style: (feature) => {
            switch (feature.getGeometry().getType()) {
                case 'Polygon':
                    return [
                        new Style({
                            fill: new Fill({ color: [255, 255, 255, 0.2] }),
                            stroke: new Stroke({ color: [0, 0, 255, 1], width: 1 })
                        })
                    ];
                case 'Circle':
                    return [
                        new Style({
                            image: new Icon({
                                anchor: [0.5, 1],
                                anchorXUnits: 'fraction',
                                anchorYUnits: 'fraction',
                                src: './src/assets/img/pin-icon.png'
                            })
                        })
                    ];
                default:
                    return [];
            }
        }
    });

    // constructor(private localDB: LocalDatabase) { }

    // buildMap(element): Map {
    //     if (!this.currentView.get('touched')) {
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
    //     } // TODO checker où est appelé buildMap sur angularJS
    // }


}
