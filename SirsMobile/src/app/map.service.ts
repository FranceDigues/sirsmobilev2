import { Injectable } from '@angular/core';
import { OLService } from './lib-map/ol.service';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import WKT from 'ol/format/WKT';
import * as olSphere from 'ol/sphere';
import * as olInteraction from 'ol/interaction';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import VectorSource from 'ol/source/Vector';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    wktFormat = new WKT();
    wgs84Sphere = new olSphere(6378137);
    selectInteraction = new olInteraction.LongClickSelect({
        circleStyle: new Style({
            fill: new Fill({ color: [255, 255, 255, 0.5] })
        }),
        layers: (olLayer) => {
            const model = olLayer.get('model');
            if (typeof model === 'object') {
                return model.selectable === true && model.visible === true // && appLayers.getVisible // TODO
            }
            return olLayer.get('name') === 'Edition' // && editionLayer.getVisible // TODO
        }
    });
    backLayers = new LayerGroup({
        name: 'Background',
        layers: [
            // createBackLayerInstance(BackLayerService.getActive) // TODO
        ]
    })
    appLayers = new LayerGroup({
        name: 'Objects',
        // layers: AppLayersService.getFavorites().map(createAppLayerInstance) // TODO
    })
    // editionLayer = createEditionLayerInstance(); // TODO
    geolocLayer = new VectorLayer({
        name: 'Geolocation',
        // visible: GeolocationService.isEnabled() // TODO
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
                case 'Point':
                    return [
                        new Style({
                            image: new Icon({
                                anchor: [0.5, 1],
                                anchorXUnits: 'fraction',
                                anchorYUnits: 'fraction',
                                // src: 'img/pin-icon.png', // TODO
                            })
                        })
                    ];
                default:
                    return [];
            }
        }
    });

    constructor(private olService: OLService) { }


}
