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
import { EditionModeService } from './editionmode.service';
import { SirsDocService } from './sirsdoc.service';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { RealPositionStyle } from './style.service';
import { LocalDatabase } from './usingLocalDatabase.service';
// import { LocalDatabase } from './usingLocalDatabase.service';
// import { defaults } from 'ol/interaction';
// import Select from 'ol/interaction/Select';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    currentView = new View({
        zoom: 6,
        center: transform([2.7246, 47.0874], 'EPSG:4326', 'EPSG:3857'),
        enableRotation: false
    });
    selection = {
        list: [],
        active: null
    }
    wktFormat = new WKT(); // ? mb useful
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
    // backLayers = new LayerGroup({ // TODO
    //     name: 'Background',
    //     layers: [
    //         // createBackLayerInstance(BackLayerService.getActive) // TODO
    //     ]
    // })
    // appLayers = new LayerGroup({ // TODO
    //     name: 'Objects',
    //     // layers: AppLayersService.getFavorites().map(createAppLayerInstance) // TODO
    // })
    editionLayer: ImageLayer = this.createEditionLayerInstance(); // ! Ranger toutes les méthodes permettant de créer l'Edition Layer dans un autre Service
    geolocLayer = new VectorLayer({
        name: 'Geolocation',
        visible: true,
        source: new VectorSource({useSpatialIndex: false}),
        style: (feature) => {
            switch (feature.getGeometry().getType()) {
                case 'Circle':
                    return [
                        new Style({
                            fill: new Fill({ color: [255, 255, 255, 0.3] }),
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
                                src: '../assets/img/pin-icon.png'
                            })
                        })
                    ];
                default:
                    return [];
            }
        }
    });

    constructor(private SirsDoc: SirsDocService, private realPositionService: RealPositionStyle,
                private localDB: LocalDatabase, private editionService: EditionModeService) { }

    get getSelection() {
        return this.selection;
    }

    redrawEditionModeLayer(layer) {
        layer.getSource().clear();
        this.editionLayer = layer;
        this.setEditionLayerFeatures(this.editionLayer);
    }

    redrawEditionLayerAfterSynchronization() {
        this.editionLayer.getSource().clear();
        this.setEditionLayerFeatures(this.editionLayer);
    }

    createEditionLayerInstance() {
        var olLayer = new ImageLayer({
            name: 'Edition',
            arch_objects: false,
            source: new VectorSource({ useSpatialIndex: false })
        });

        this.setEditionLayerFeatures(olLayer); // Set the layer that contains the newx objects of the edition mode
        return olLayer;
    }

    setEditionLayerFeatures(olLayer) {
        let olSource = olLayer.getSource();

        this.editionService.getEditionModeObjects5() // ! don't use it bcs circle dependencies
        .then(
            (results) => {
                olSource.clear();
                olSource.addFeatures(this.createEditionFeatureInstances(results))
            }
        );
    }

    createEditionFeatureInstances(featureDocs) {
        let features = [];
        featureDocs.forEach((featureDoc) => {
            if (featureDoc.doc && (featureDoc.doc.positionDebut || featureDoc.doc.approximatePositionDebut
                || (featureDoc.doc['@class'].toLowerCase().indexOf('dependance') > -1))) {
                    features.push(this.createEditionFeatureInstance(featureDoc.doc));
                }
        });
        return features;
    }

    createEditionFeatureInstance(featureDoc): Feature {
        // Compute geometry.
        let SirsDoc = this.SirsDoc;
        let geometry = null;
        let dataProjection = (SirsDoc && SirsDoc.get() && SirsDoc.get().epsgCode) ? SirsDoc.get().epsgCode : "EPSG:2154";

        if (featureDoc.geometry && featureDoc['@class'].toLowerCase().indexOf('dependance') > -1) {
            geometry = this.wktFormat.readGeometry(featureDoc.geometry).transform(dataProjection, 'EPSG:3857');
        } else {
            geometry = this.wktFormat.readGeometry(featureDoc.positionDebut ? featureDoc.positionDebut : featureDoc.approximatePositionDebut).transform(dataProjection, 'EPSG:3857');
            if (geometry && ((featureDoc.positionFin && (featureDoc.positionFin !== featureDoc.positionDebut))
                || (featureDoc.approximatePositionFin && (featureDoc.approximatePositionFin !== featureDoc.approximatePositionDebut)))) {
                geometry = new LineString([
                    geometry.getFirstCoordinate(),
                    this.wktFormat.readGeometry(featureDoc.positionFin ? featureDoc.positionFin : featureDoc.approximatePositionFin).transform(dataProjection, 'EPSG:3857').getFirstCoordinate()
                ]);
            }
        }

        let feature = new Feature({ geometry: geometry });
        feature.setStyle(this.realPositionService.style([0, 0, 255, 1], geometry.getType()));
        feature.set('id', featureDoc._id);
        feature.set('rev', featureDoc._rev);
        feature.set('author', featureDoc.author);
        feature.set('description', featureDoc.description);
        feature.set('designation', featureDoc.designation);
        feature.set('@class', featureDoc['@class']);

        return feature;
    }

    createGeolocFeatureInstances(coords): Array<Feature> {
        return [
            new Feature({
                geometry: new Point(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857')),
                name: 'Location Pointer'
            }),
            new Feature({
                geometry: new Circle(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'), 40)
            })
        ];
    }

    // constructor(private localDB: LocalDatabase) { }

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
