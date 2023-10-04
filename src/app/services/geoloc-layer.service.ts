// @ts-nocheck

import { Injectable } from "@angular/core";

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { transform } from 'ol/proj';
import Circle from 'ol/geom/Circle';

@Injectable({
    providedIn: 'root'
})
export class GeolocLayerService {
    private readonly geolocLayer: VectorLayer<any>;

    constructor() {
        this.geolocLayer = this.createGeolocLayer();
    }

    getGeolocLayer(): VectorLayer<any> {
        return this.geolocLayer;
    }

    createGeolocLayer(): VectorLayer<any> {
        let layer = new VectorLayer({
            visible: true,
            source: new VectorSource({useSpatialIndex: false}),
            style: (feature) => {
                switch (feature.getGeometry().getType()) {
                    case 'Circle':
                        return [
                            new Style({
                                fill: new Fill({color: [255, 255, 255, 0.3]}),
                                stroke: new Stroke({color: [0, 0, 255, 1], width: 1})
                            })
                        ];
                    case 'Point':
                        return [
                            new Style({
                                image: new Icon({
                                    anchor: [0.5, 1],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    src: '../assets/img/pin-icon.png'
                                })
                            })
                        ];
                    default:
                        return [];
                }
            }
        });
        layer.set('name', 'Geolocation');
        return layer;
    }

    createGeolocFeatureInstances(coords): Array<Feature> {
        return [
            new Feature({
                geometry: new Point(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857')),
                name: 'Location Pointer'
            }),
            new Feature({
                geometry: new Circle(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'), coords.accuracy)
            })
        ];
    }

    redrawGeolocLayer(coords): void {
        const geolocLayerSource = this.geolocLayer.getSource();
        geolocLayerSource.clear();
        geolocLayerSource.addFeatures(this.createGeolocFeatureInstances(coords));
        geolocLayerSource.changed();
    }

    clearGeolocLayer(): void {
        const geolocLayerSource = this.geolocLayer.getSource();
        geolocLayerSource.clear();
        geolocLayerSource.changed();
    }
}