import { Injectable } from '@angular/core';
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
import { RealPositionStyle } from './style.service';
import { LocalDatabase } from './usingLocalDatabase.service';
import { MapService } from './map.service';
import LayerGroup from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import Source from 'ol/source/Source';
import OSM from 'ol/source/OSM';

@Injectable({
    providedIn: 'root'
})
export class EditionLayer {

    editionLayer: ImageLayer = this.createEditionLayerInstance();

    wktFormat = new WKT();

    constructor(private localDB: LocalDatabase, private SirsDoc: SirsDocService,
                private realPositionService: RealPositionStyle, private mapService: MapService) { }

    get getEditionLayer() {
        if (!this.editionLayer) {
            this.createEditionLayerInstance();
        } else {
            return this.editionLayer;
        }
    }

    createEditionLayerInstance() {
        let olLayer = new VectorLayer({
            name: 'Edition',
            source: new VectorSource({ useSpatialIndex: false })
        });

        this.setEditionLayerFeatures(olLayer); // Set the layer that contains the newx objects of the edition mode
        return olLayer;
    }

    setEditionLayerFeatures(olLayer) {
        let olSource = olLayer.getSource();

        return this.localDB.query('objetsModeEdition5/objetsModeEdition5', { include_docs: true })
        .then(
            (results) => {
                olSource.clear();
                olSource.addFeatures(this.createEditionFeatureInstances(results))
                return;
            },
            (error) => {
                console.log('Error debug', error);
                return;
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
        let geometry = undefined;
        let dataProjection = (SirsDoc && SirsDoc.get() && SirsDoc.get().epsgCode) ? SirsDoc.get().epsgCode : "EPSG:2154";

        if (featureDoc.geometry && featureDoc['@class'].toLowerCase().indexOf('dependance') > -1) {
            geometry = this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection: dataProjection,
                featureProjection: 'EPSG:3857'
            });
            console.log(geometry);
        } else {
            geometry = this.wktFormat.readGeometry(featureDoc.positionDebut ? featureDoc.positionDebut : featureDoc.approximatePositionDebut,
                {
                    dataProjection: dataProjection,
                    featureProjection: 'EPSG:3857'
                }
            );
            if (geometry && ((featureDoc.positionFin && (featureDoc.positionFin !== featureDoc.positionDebut))
                || (featureDoc.approximatePositionFin && (featureDoc.approximatePositionFin !== featureDoc.approximatePositionDebut)))) {
                geometry = new LineString([
                    geometry.getFirstCoordinate(),
                    this.wktFormat.readGeometry(featureDoc.positionFin ? featureDoc.positionFin : featureDoc.approximatePositionFin,
                        {
                            dataProjection: dataProjection,
                            featureProjection: 'EPSG:3857'
                        }
                    ).getFirstCoordinate()
                ]);
            }
        }

        let feature = new Feature({ geometry: geometry });
        feature.setStyle(this.realPositionService.style(this.mapService.selection, [0, 0, 255, 1], geometry.getType()));
        feature.set('id', featureDoc._id);
        feature.set('rev', featureDoc._rev);
        feature.set('author', featureDoc.author);
        feature.set('description', featureDoc.description);
        feature.set('designation', featureDoc.designation);
        feature.set('@class', featureDoc['@class']);

        return feature;
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
}

@Injectable({
    providedIn: 'root'
})
export class GeolocLayer {
    geolocLayer: VectorLayer = this.createGeolocLayer();

    get getGeolocLayer() {
        if (!this.geolocLayer) {
            this.geolocLayer = this.createGeolocLayer();
            return this.geolocLayer;
        } else {
            return this.geolocLayer;
        }
    }

    createGeolocLayer(): VectorLayer {
        return new VectorLayer({
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

    redrawGeolocLayer(coords) {
        let geolocLayerSource = this.getGeolocLayer.getSource();
        geolocLayerSource.clear();
        geolocLayerSource.addFeatures(this.createGeolocFeatureInstances(coords));
    }
}

@Injectable({
    providedIn: 'root'
})
export class BackLayer {
    backLayer: LayerGroup = this.createBackLayer();

    createBackLayer() {
        return new LayerGroup({
            name: 'Background',
            layers: [
                this.createBackLayerInstance('') // TODO change argument
            ]
        });
    }

    createBackLayerInstance(layerModel): TileLayer { // TODO FINISH
        let layer = null;

        console.log('LayerModel', layerModel);
        // if (typeof layerModel.cache === 'object' && layerModel.cache.active) {
        //     const extent = layerModel.cache.extent;

        //     const source = new XYZ({
        //         url: layerModel.cache.url
        //     });
        //     layer = new TileLayer({
        //         name: layerModel.name,
        //         extent: extent,
        //         source: source
        //     });
        // } else {
        //     layer = new TileLayer({
        //         name: layerModel.name,
        //         model: layerModel,
        //         source: new Source(layerModel.source) // ? not sure
        //     });
        // }
        layer = new TileLayer({
            source: new OSM({
                        url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    })
        })
        return layer;
    }

    syncBackLayer() {
        const olLayer = this.createBackLayerInstance('') // TODO change argument
        this.backLayer.getLayers().setAt(0, olLayer);
    }
}

@Injectable({
    providedIn: 'root'
})
export class AppLayer {
    appLayer: LayerGroup;
}
