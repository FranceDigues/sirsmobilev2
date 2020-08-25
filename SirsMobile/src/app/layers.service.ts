import { Injectable } from '@angular/core';
import View from 'ol/View';
import WKT from 'ol/format/WKT';
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
import { RealPositionStyle, DefaultStyle } from './style.service';
import { LocalDatabase } from './usingLocalDatabase.service';
import { MapService } from './map.service';
import LayerGroup from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import Source from 'ol/source/Source';
import OSM from 'ol/source/OSM';
import Cluster from 'ol/source/Cluster';
import { FeatureCache } from './cache.service';
import { noop } from 'rxjs';
import { StorageService } from '@lib-storage/storage.service';
import { AppLayersService } from './applayers.service';
import { ListBackLayer } from './models/database.model';
import TileWMS from 'ol/source/TileWMS';
import { BackLayerService } from './backlayer.service';
import { OLService } from '@lib-map/ol.service';

@Injectable({
    providedIn: 'root'
})
export class EditionLayer {

    editionLayer = this.createEditionLayerInstance();

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
        feature.setStyle(this.realPositionService.style(this.mapService.selection, feature, [0, 0, 255, 1], geometry.getType()));
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

    backLayer: LayerGroup;

    constructor(private backLayerService: BackLayerService, private mapService: MapService,
                private ol: OLService) {
                    this.backLayerService.init()
                    .then(
                        () => {
                            this.backLayer = this.createBackLayer();
                        }
                    )
                }

    createBackLayer() {
        // * give time for backLayerService to init
        return new LayerGroup({
            name: 'Background',
            layers: [
                this.createBackLayerInstance(this.backLayerService.getActive())
            ]
        });
    }

    private goodBackLayerSource(layerModel: ListBackLayer) {
        console.log(layerModel);
        if (layerModel.source.type === 'OSM') {
            return new OSM(layerModel.source);
        } else if (layerModel.source.type === 'TileWMS') {
            return new TileWMS(layerModel.source)
        } else if (layerModel.source.type === 'XYZ') {
            return new XYZ(layerModel.source);
        } else {
            return new OSM({
                url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            });
        }
    }

    createBackLayerInstance(layerModel): TileLayer {
        let layer = null;

        console.log('LayerModel', layerModel);
        if (typeof layerModel.cache === 'object' && layerModel.cache.active) {
            const extent = layerModel.cache.extent;

            const source = new XYZ({
                url: layerModel.cache.url
            });
            layer = new TileLayer({
                name: layerModel.name,
                extent: extent,
                source: source
            });
        } else {
            layer = new TileLayer({
                name: layerModel.name,
                model: layerModel,
                source: this.goodBackLayerSource(layerModel)
            });
        }
        return layer;
    }

    setActiveBackLayers(layer) {
        this.backLayerService.backLayers.active = layer;
        this.updateBackLayerMap(layer);
    }

    updateBackLayerMap(layer: ListBackLayer) {
        this.backLayer.getLayers().setAt(0, this.createBackLayerInstance(layer));

        if (typeof layer.cache === 'object') {
            this.mapService.currentView.fit(layer.cache.extent, this.ol.map.getSize())
        }
    }

    syncBackLayer() {
        const olLayer = this.backLayer.createBackLayerInstance(this.backLayerService.getActive())
        this.backLayer.backLayer.getLayers().setAt(0, olLayer);
    }
}

@Injectable({
    providedIn: 'root'
})
export class AppLayer {

    appLayer: LayerGroup = this.createAppLayer();
    wktFormat = new WKT();

    constructor(private featureCache: FeatureCache, private localDB: LocalDatabase,
                private storageService: StorageService, private SirsDoc: SirsDocService,
                private mapService: MapService, private RealPositionStyle: RealPositionStyle,
                private DefaultStyle: DefaultStyle, private appLayersService: AppLayersService) {}

    createAppLayer(): LayerGroup {
        return new LayerGroup({
            name: 'Objects',
            layers: this.appLayersService.getFavorites().map((layerModel) => { console.log('start', layerModel); return (this.createAppLayerInstance(layerModel)); })
        })
    }

    createAppLayerInstance(layerModel) {
        let olLayer: VectorLayer;
        if (layerModel.filterValue === 'fr.sirs.core.model.BorneDigue') {
            //@hb Change the layer Source to Cluster source
            olLayer = new VectorLayer ({
                name: layerModel.title,
                visible: layerModel.visible,
                model: layerModel,
                style: (feature, resolution) => {
                    var features = feature.get('features');
                    var styles = [];

                    if (Array.isArray(features) && features.length > 0) {
                        features.forEach((_feature) => {
                            var style = _feature.getStyle();
                            if (typeof style === 'function') {
                                style = style.call(_feature, _feature, resolution);
                            } else if (style instanceof Style) {
                                style = [].concat(style);
                            }

                            if (Array.isArray(style)) {
                                style.forEach((_style) => {
                                    _style.setGeometry(_feature.getGeometry());
                                    if (_style.getText() !== undefined && _style.getText() !== null) {
                                        _style.getText().setText(undefined);
                                    }
                                    styles.push(_style);
                                });
                            }
                        });

                        var style = features[0].getStyle();
                        if (typeof style === "function") {
                            style = style.call(feature, feature, resolution);
                        } else if (style instanceof Style) {
                            style = [].concat(style);
                        }


                        if (Array.isArray(style)) {
                            style.forEach((_style) => {
                                styles.push(new Style({
                                    zIndex: _style.getZIndex(),
                                    text: _style.getText()
                                }));
                                });
                        }
                    }
                    return styles;
                },
                source: new Cluster({
                    distance: 24,
                    source: new VectorSource({useSpatialIndex: true})
                })
            });

        } else {
            olLayer = new VectorLayer({
                name: 'test-amigo',
                visible: layerModel.visible,
                model: layerModel,
                source: new VectorSource({useSpatialIndex: false})
            });
        }

        if (layerModel.visible === true) {
            this.setAppLayerFeatures(olLayer);
        }
        console.log('end', olLayer);
        return olLayer;
    }

    async setAppLayerFeatures(olLayer) {
        let layerModel = olLayer.get('model');
        let olSource = null;

        console.log('olLayer ATTENTION VERIF', olLayer);
        if (layerModel.filterValue === "fr.sirs.core.model.BorneDigue") {
            olSource = olLayer.getSource().getSource();
        } else {
            olSource = olLayer.getSource();
        }

        // Try to get the promise of a previous query.
        let promise = this.featureCache.get(layerModel.title);

        if (typeof promise === 'undefined') {

            if (layerModel.filterValue !== "fr.sirs.core.model.BorneDigue" && layerModel.filterValue !== "fr.sirs.core.model.TronconDigue") {
                //Get all the favorites tronçons ids
                let favorites = await this.storageService.getItem("AppTronconsFavorities");
                let keys = [];
                if (favorites !== null && favorites.length !== 0) {
                    favorites.forEach((key) => {
                        keys.push([layerModel.filterValue, key.id]);
                    });

                    promise = this.localDB.query('ElementSpecial3', {
                        keys: keys
                    }).then(
                        (results) => {
                            return results.map(this.createAppFeatureModel);
                        },
                        (error) => {
                            console.error(error);
                        });
                } else {
                    if (layerModel.filterValue.toLowerCase().indexOf('dependance') > -1) {
                        promise = this.localDB.query('Element/byClassAndLinear', {
                            startkey: [layerModel.filterValue],
                            endkey: [layerModel.filterValue, {}],
                            include_docs: true
                        }).then((results) => {
                                return results.filter((item) => {
                                    return !item.doc.editMode;
                                }).map(this.createAppFeatureModel);
                            },
                            (error) => {
                                console.error(error);
                            });
                    } else {
                        noop();
                        // var deferred = $q.defer();
                        // promise = deferred.promise
                        //     .then(function () {
                        //         return [];
                        //     });
                        // deferred.resolve();
                    }
                }
            } else if (layerModel.filterValue === "fr.sirs.core.model.TronconDigue") {
                let tmp = await this.storageService.getItem("AppTronconsFavorities");
                promise = this.localDB.query('TronconDigue/streamLight', {
                    keys: tmp === null ? [] : tmp.map((item) => {
                            return item.id;
                        })
                }).then(
                    (results) => {
                        return results.map(this.createAppFeatureModel);
                    },
                    (error) => {
                        console.log(error);
                    });
            } else {
                let tmp = await this.storageService.getItem("AppTronconsFavorities");
                promise = this.localDB.query('getBornesFromTronconID', {
                    keys: tmp === null ? [] : tmp.map((item) => {
                            return item.id;
                        })
                }).then(
                    (results) => {
                        return this.localDB.query('getBornesIdsHB', {
                            keys: results.map((obj) => {
                                return obj.value;
                            })
                        }).then(
                            function (results2) {
                                return results2.map(this.createAppFeatureModel());
                            });
                    },
                    (error) => {
                        console.log(error);
                    });
            }


            // Set and store the promise.
            this.featureCache.put(layerModel.title, promise);
        }

        // Wait for promise resolution or rejection.
        promise.then(
            (featureModels) => {
                // @hb get the featureModels from the promise

                olSource.addFeatures(this.createAppFeatureInstances(featureModels, layerModel));
                // $rootScope.loadingflag = false; // TODO remplace ?
            },
            (error) => {
                // TODO → handle error
            });


    }

    createAppFeatureModel(featureDoc) {
        featureDoc = featureDoc.doc || featureDoc.value; // depending on "include_docs" option when querying docs

        let dataProjection = typeof this.SirsDoc.get().epsgCode === 'undefined' ? "EPSG:2154" : this.SirsDoc.get().epsgCode;

        let projGeometry = null;
        let realGeometry = null;

        if (featureDoc.geometry && featureDoc['@class'] && featureDoc['@class'].toLowerCase().indexOf('dependance') > -1) {
            projGeometry = this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection: dataProjection,
                featureProjection: 'EPSG:3857'
            });
            realGeometry = this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection: dataProjection,
                featureProjection: 'EPSG:3857'
            });
        } else {
            projGeometry = featureDoc.geometry ? this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection: dataProjection,
                featureProjection: 'EPSG:3857'
            }) : undefined;

            if (projGeometry instanceof LineString && projGeometry.getCoordinates().length === 2 &&
                projGeometry.getCoordinates()[0][0] === projGeometry.getCoordinates()[1][0] &&
                projGeometry.getCoordinates()[0][1] === projGeometry.getCoordinates()[1][1]) {
                projGeometry = new Point(projGeometry.getCoordinates()[0]);
            }

            realGeometry = featureDoc.positionDebut ?
                this.wktFormat.readGeometry(featureDoc.positionDebut, {
                    dataProjection: dataProjection,
                    featureProjection: 'EPSG:3857'
                }) : undefined;

            if (realGeometry && featureDoc.positionFin && featureDoc.positionFin !== featureDoc.positionDebut) {
                realGeometry = new LineString([
                    realGeometry.getFirstCoordinate(),
                    this.wktFormat.readGeometry(featureDoc.positionFin, {
                        dataProjection: dataProjection,
                        featureProjection: 'EPSG:3857'
                    }).getFirstCoordinate()
                ]);
            }

        }

        return {
            id: featureDoc.id || featureDoc._id,
            rev: featureDoc.rev || featureDoc._rev,
            designation: featureDoc.designation,
            title: featureDoc.libelle,
            projGeometry: projGeometry,
            realGeometry: realGeometry,
            archive: featureDoc.date_fin ? true : false
        };
    }

    createAppFeatureInstances(featureModels, layerModel) {
        var features = [];
        // get each feature from the featureModel
        featureModels.forEach((featureModel) => {
            if ((layerModel.realPosition && featureModel.realGeometry) || (!layerModel.realPosition && featureModel.projGeometry)) {
                if (this.mapService.archiveObjectsFlag) {
                    // Show all the objects
                    var feature = new Feature();
                    if (layerModel.realPosition) {
                        feature.setGeometry(featureModel.realGeometry);
                        feature.setStyle(this.RealPositionStyle.style(this.mapService.selection, feature, layerModel.color, featureModel.realGeometry.getType(), featureModel, layerModel));
                    } else {
                        feature.setGeometry(featureModel.projGeometry);
                        feature.setStyle(this.DefaultStyle.style(this.mapService.selection, feature, layerModel.color, featureModel.projGeometry.getType(), featureModel, layerModel));
                    }
                    feature.set('id', featureModel.id);
                    feature.set('categories', layerModel.categories);
                    feature.set('rev', featureModel.rev);
                    feature.set('designation', featureModel.designation);
                    feature.set('@class', layerModel.filterValue);
                    feature.set('title', featureModel.libelle);
                    features.push(feature);
                } else {
                    //Show only not archived objects
                    if (!featureModel.archive) {
                        var feature = new Feature();
                        if (layerModel.realPosition) {
                            feature.setGeometry(featureModel.realGeometry);
                            feature.setStyle(this.RealPositionStyle.style(this.mapService.selection, feature, layerModel.color, featureModel.realGeometry.getType(), featureModel, layerModel));
                        } else {
                            feature.setGeometry(featureModel.projGeometry);
                            feature.setStyle(this.DefaultStyle.style(this.mapService.selection, feature, layerModel.color, featureModel.projGeometry.getType(), featureModel, layerModel));
                        }
                        feature.set('id', featureModel.id);
                        feature.set('categories', layerModel.categories);
                        feature.set('rev', featureModel.rev);
                        feature.set('designation', featureModel.designation);
                        feature.set('@class', layerModel.filterValue);
                        feature.set('title', featureModel.libelle);
                        features.push(feature);
                    }
                }
            }
        });
        return features;
    }

    syncAllAppLayer() {
        let layers = this.appLayer.getLayers();
        layers.forEach((layer) => {
            let layerModel = layer.get('model');
            let olLayer = this.getAppLayerInstance(layerModel);

            olLayer.setVisible(layerModel.visible);
            olLayer.getSource().clear();
            if (layerModel.visible === true) {
                this.setAppLayerFeatures(olLayer);
            }
        });
    }

    private getAppLayerInstance(layerModel) {
        let layers = this.appLayer.getLayers();
        let i = layers.getLength();
        while (i--) {
            if (layers.item(i).get('model') === layerModel) {
                return layers.item(i);
            }
        }
        return null;
    }

    syncAppLayer(layerModel) {
        let olLayer = this.getAppLayerInstance(layerModel);

        olLayer.setVisible(layerModel.visible);
        if (layerModel.filterValue === "fr.sirs.core.model.BorneDigue") {
            olLayer.getSource().getSource().clear();
        } else {
            olLayer.getSource().clear();
        }
        if (layerModel.visible === true) {
            // TODO loading here
            setTimeout(() => {
                this.setAppLayerFeatures(olLayer);
            }, 1000);
        }
    }

    clearAll() {
        this.appLayersService.getFavorites().forEach(
            (layer) => {
                this.forceRefresh(layer);
            }
        );
    }

    forceRefresh(layer) {
        const cache = this.featureCache.get(layer.title);
        if (cache === undefined) {
            this.featureCache.remove(layer.title);
            if (layer.visible) {
                this.syncAppLayer(layer);
            }
        }
    }
}
