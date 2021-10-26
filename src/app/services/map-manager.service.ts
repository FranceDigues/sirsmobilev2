import { Injectable } from '@angular/core';
import { StorageService } from '@ionic-lib/lib-storage/storage.service';
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import { AppLayersService } from './app-layers.service';
import { FeatureCache } from './cache.service';
import { MapService } from './map.service';
import { SirsDocService } from './sirsdoc.service';
import { DefaultStyle, RealPositionStyle } from './style.service';
import { LocalDatabase } from './local-database.service';
import { Subject } from 'rxjs';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { DatabaseService } from './database.service';
import { PluginUtils } from '../utils/plugin-utils';

@Injectable({
    providedIn: 'root'
})
export class MapManagerService {
    appLayer: LayerGroup = null;
    wktFormat = new WKT();
    public mapLoadingSubject = new Subject();

    constructor(private featureCache: FeatureCache,
        private localDB: LocalDatabase,
        private storageService: StorageService,
        private SirsDocService: SirsDocService,
        private mapService: MapService,
        private RealPositionStyle: RealPositionStyle,
        private DefaultStyleService: DefaultStyle,
        private appLayersService: AppLayersService,
        private olService: OLService,
        private databaseSrvc: DatabaseService,
    ) {
    }

    init() {
        return new Promise((resolve, reject) => {
            this.createAppLayer()
                .then((appLayer: any) => {
                    this.appLayer = appLayer;
                    if (this.appLayer) {
                        this.olService.addLayer(this.appLayer);
                    } else {
                        console.warn("mapManagerService.appLayer is not initialized. If the app has been opened without any 'couche métier' loaded this is normal.");
                    }
                    resolve(appLayer);
                }, (error) => {
                    console.error(error);
                    reject(error);
                });
        })
    }

    private createAppLayer() {
        return new Promise(resolve => {
            const promises = [];
            let appLayers = this.appLayersService.getFavorites();

            if (appLayers && appLayers.length > 0) {
                appLayers.forEach((layerModel) => {
                    promises.push(this.createAppLayerInstance(layerModel));
                });

                Promise.all(promises).then(responses => {
                    const layerGroup = new LayerGroup({
                        name: 'Objects',
                        layers: responses
                    });
                    resolve(layerGroup);
                    this.mapLoadingSubject.complete();
                });
            } else {
                this.mapLoadingSubject.complete();
                resolve(null);
            }
        });
    }

    createAppLayerInstance(layerModel) {
        return new Promise(resolve => {
            let olLayer: VectorLayer;
            if (layerModel.filterValue === 'fr.sirs.core.model.BorneDigue') {
                // Change the layer Source to Cluster source
                olLayer = new VectorLayer({
                    name: layerModel.title,
                    visible: layerModel.visible,
                    model: layerModel,
                    style: (feature, resolution) => {
                        const features = feature.get('features');
                        const styles = [];

                        if (Array.isArray(features) && features.length > 0) {
                            features.forEach((tmpFeature) => {
                                let style = tmpFeature.getStyle();
                                if (typeof style === 'function') {
                                    style = style.call(tmpFeature, tmpFeature, resolution);
                                } else if (style instanceof Style) {
                                    style = [].concat(style);
                                }

                                if (Array.isArray(style)) {
                                    style.forEach((tmpStyle) => {
                                        tmpStyle.setGeometry(tmpFeature.getGeometry());
                                        if (tmpStyle.getText() !== undefined && tmpStyle.getText() !== null) {
                                            tmpStyle.getText().setText(undefined);
                                        }
                                        styles.push(tmpStyle);
                                    });
                                }
                            });

                            let style = features[0].getStyle();
                            if (typeof style === 'function') {
                                style = style.call(feature, feature, resolution);
                            } else if (style instanceof Style) {
                                style = [].concat(style);
                            }


                            if (Array.isArray(style)) {
                                style.forEach((tmpStyle) => {
                                    styles.push(new Style({
                                        zIndex: tmpStyle.getZIndex(),
                                        text: tmpStyle.getText()
                                    }));
                                });
                            }
                        }
                        return styles;
                    },
                    source: new Cluster({
                        distance: 24,
                        source: new VectorSource({ useSpatialIndex: true })
                    })
                });

            } else {
                olLayer = new VectorLayer({
                    name: layerModel.title,
                    visible: layerModel.visible,
                    model: layerModel,
                    source: new VectorSource({ useSpatialIndex: false })
                });
            }

            if (layerModel.visible === true) {
                this.setAppLayerFeatures(olLayer).then(response => {
                    resolve(olLayer);
                });
            } else {
                resolve(olLayer);
            }
        });
    }

    setAppLayerFeatures(olLayer) {
        return new Promise(async resolve => {
            const layerModel = olLayer.get('model');
            const olSource = layerModel.filterValue === 'fr.sirs.core.model.BorneDigue'
                ? olLayer.getSource().getSource() : olLayer.getSource();
            // Try to get the promise of a previous query.
            let promise = null;
            if (layerModel.filterValue !== 'fr.sirs.core.model.BorneDigue' &&
                layerModel.filterValue !== 'fr.sirs.core.model.TronconDigue') {
                if (PluginUtils.isDependanceClass(layerModel.filterValue)) {
                    promise = this.localDB.query('Element/byClassAndLinear', {
                        startkey: [layerModel.filterValue],
                        endkey: [layerModel.filterValue, {}],
                        include_docs: true
                    }).then(
                        (results) => {
                            return results.filter((item) => {
                                return !item.doc.editMode;
                            }).map(this.createAppFeatureModel.bind(this));
                        },
                        (error) => {
                            console.error(error);
                        }
                    ).catch((error) => {
                        console.error(error);
                    });
                } else {
                    // Get all the favorites tronçons ids
                    const favorites = await this.storageService.getItem('AppTronconsFavorities'); // TODO : that shit returns something null / empty. WHY ?!?!?§
                    const keys = [];
                    if (favorites !== null && Array.isArray(favorites) && favorites.length !== 0) {
                        favorites.forEach((key) => {
                            keys.push([layerModel.filterValue, key.id]);
                        });

                        promise = this.localDB.query('ElementSpecial3', {
                            keys
                        }).then(
                            (results) => {
                                return results.map(this.createAppFeatureModel.bind(this));
                            },
                            (error) => {
                                console.error(error);
                            }
                        ).catch((error) => {
                            console.error(error);
                        });
                    } else {
                        promise = new Promise((resolve2) => { // TODO : should not reach this else or at least do something... 
                            resolve2([]);
                        }).then(
                            () => {
                                return [];
                            }
                        ),
                            (error) => {
                                console.error(error);
                            };
                    }
                }
            } else if (layerModel.filterValue === 'fr.sirs.core.model.TronconDigue') {
                let tmp: any = await this.storageService.getItem('AppTronconsFavorities');
                promise = this.localDB.query('TronconDigue/streamLight', {
                    keys: tmp === null ? [] : tmp.map((item) => {
                        return item.id;
                    })
                }).then(
                    (results) => {
                        return results.map(this.createAppFeatureModel.bind(this));
                    },
                    (error) => {
                        console.error(error);
                    });
            } else {
                const tmp: any = await this.storageService.getItem('AppTronconsFavorities');
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
                            (results2) => {
                                return results2.map(this.createAppFeatureModel.bind(this));
                            });
                    },
                    (error) => {
                        console.error(error);
                    });
            }
            // Wait for promise resolution or rejection.
            promise.then((featureModels) => {
                olSource.addFeatures(this.createAppFeatureInstances(featureModels, layerModel));
                resolve(null);
                this.mapLoadingSubject.complete();
            },
                (error) => {
                    console.error(error);
                }
            );
        });
    }

    // Arrow function or 'this' is undefined... Seems like there is a scope problem.
    createAppFeatureModel(featureDoc) {
        // depending on 'include_docs' option when querying docs
        featureDoc = featureDoc.doc || featureDoc.value;
        let dataProjection;

        if (!this.SirsDocService.get()) {
            dataProjection = 'EPSG:2154'
        } else {
            if (this.SirsDocService.get().epsgCode) {
                dataProjection = this.SirsDocService.get().epsgCode;
            } else {
                dataProjection = 'EPSG:2154'
            }
        }
        let projGeometry;
        let realGeometry;

        if (featureDoc.geometry && featureDoc['@class'] && PluginUtils.isDependanceClass(featureDoc['@class'])) {
            projGeometry = this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });
            realGeometry = this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });
        } else {
            projGeometry = featureDoc.geometry ? this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            }) : undefined;

            if (projGeometry instanceof LineString && projGeometry.getCoordinates().length === 2 &&
                projGeometry.getCoordinates()[0][0] === projGeometry.getCoordinates()[1][0] &&
                projGeometry.getCoordinates()[0][1] === projGeometry.getCoordinates()[1][1]) {
                projGeometry = new Point(projGeometry.getCoordinates()[0]);
            }

            realGeometry = featureDoc.positionDebut ?
                this.wktFormat.readGeometry(featureDoc.positionDebut, {
                    dataProjection,
                    featureProjection: 'EPSG:3857'
                }) : undefined;

            if (realGeometry && featureDoc.positionFin && featureDoc.positionFin !== featureDoc.positionDebut) {
                realGeometry = new LineString([
                    realGeometry.getFirstCoordinate(),
                    this.wktFormat.readGeometry(featureDoc.positionFin, {
                        dataProjection,
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
            projGeometry,
            realGeometry,
            archive: featureDoc.date_fin ? true : false
        };
    }

    createAppFeatureInstances(featureModels, layerModel) {
        const features = [];
        // get each feature from the featureModel
        featureModels.forEach((featureModel) => {
            if ((layerModel.realPosition && featureModel.realGeometry) || (!layerModel.realPosition && featureModel.projGeometry)) {
                if (this.mapService.archiveObjectsFlag) {
                    // Show all the objects
                    const feature = new Feature();
                    if (layerModel.realPosition) {
                        feature.setGeometry(featureModel.realGeometry);
                        feature.setStyle(this.RealPositionStyle.style(this.mapService.selection,
                            feature, layerModel.color, featureModel.realGeometry.getType(), featureModel, layerModel));
                    } else {
                        feature.setGeometry(featureModel.projGeometry);
                        feature.setStyle(this.DefaultStyleService.style(this.mapService.selection,
                            feature, layerModel.color, featureModel.projGeometry.getType(), featureModel, layerModel));
                    }
                    feature.set('id', featureModel.id);
                    feature.set('categories', layerModel.categories);
                    feature.set('rev', featureModel.rev);
                    feature.set('designation', featureModel.designation);
                    feature.set('@class', layerModel.filterValue);
                    feature.set('title', featureModel.libelle);
                    features.push(feature);
                } else {
                    // Show only not archived objects
                    if (!featureModel.archive) {
                        const feature = new Feature();
                        if (layerModel.realPosition) {
                            feature.setGeometry(featureModel.realGeometry);
                            feature.setStyle(this.RealPositionStyle.style(this.mapService.selection,
                                feature, layerModel.color, featureModel.realGeometry.getType(), featureModel, layerModel));
                        } else {
                            feature.setGeometry(featureModel.projGeometry);
                            feature.setStyle(this.DefaultStyleService.style(this.mapService.selection,
                                feature, layerModel.color, featureModel.projGeometry.getType(), featureModel, layerModel));
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
        const layers = this.appLayer.getLayers();
        layers.forEach(async (layer) => {
            const layerModel = layer.get('model');
            const olLayer = <any>await this.getAppLayerInstance(layerModel);

            olLayer.setVisible(layerModel.visible);
            olLayer.getSource().clear();
            if (layerModel.visible === true) {
                this.setAppLayerFeatures(olLayer);
            }
        });
    }

    private async getAppLayerInstance(layerModel) {
        if (!this.appLayer) {
            await this.init();
        }
        const layers = this.appLayer.getLayers().getArray();
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].get('model') === layerModel) {
                return layers[i];
            }
        }
        return null;
    }

    async syncAppLayer(layerModel) {
        const olLayer = <any>await this.getAppLayerInstance(layerModel);

        olLayer.setVisible(layerModel.visible);
        if (layerModel.filterValue === 'fr.sirs.core.model.BorneDigue') {
            olLayer.getSource().getSource().clear();
        } else {
            olLayer.getSource().clear();
        }
        if (layerModel.visible === true) {
            // TODO loading here
            this.setAppLayerFeatures(olLayer);
            // setTimeout(() => {
            //     this.setAppLayerFeatures(olLayer);
            // }, 1000);
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

    moveAppLayer(from, to) {
        const collection = this.appLayer.getLayers().getArray();
        const tmp = collection[from];

        collection[from] = collection[to];
        collection[to] = tmp;
    }

    async addLabelFeatureLayer(layerModel) {
        const olLayer = <any>await this.getAppLayerInstance(layerModel);

        olLayer.get('model').featLabels = !olLayer.get('model').featLabels;
        olLayer.getSource().clear();
        this.setAppLayerFeatures(olLayer);
    }

    async reloadLayer(layerModel) {
        const olLayer = <any>await this.getAppLayerInstance(layerModel);

        // Load data if necessary.
        olLayer.getSource().clear();
        this.setAppLayerFeatures(olLayer);
    }

}
