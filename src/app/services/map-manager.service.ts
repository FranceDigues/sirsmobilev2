// @ts-nocheck

import { Injectable } from '@angular/core';
import { StorageService } from '@ionic-lib/lib-storage/storage.service';
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { bbox } from 'ol/loadingstrategy';
import { Subject } from 'rxjs';
import { FavoritesLayersModel } from '../components/database-connection/models/database.model';
import { PluginUtils } from '../utils/plugin-utils';
import { AppLayersService } from './app-layers.service';
import { FeatureCache } from './cache.service';
import { EditionLayerService } from "./edition-layer.service";
import { LocalDatabase } from './local-database.service';
import { MapService } from './map.service';
import { SelectedObjectsService } from "./selected-objects.service";
import { SirsDataService } from "./sirs-data.service";
import { DefaultStyle, RealPositionStyle } from './style.service';
import { DatabaseService } from "./database.service";

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
                private sirsDataService: SirsDataService,
                private mapService: MapService,
                private realPositionStyle: RealPositionStyle,
                private DefaultStyleService: DefaultStyle,
                private appLayersService: AppLayersService,
                private selectedObjectsService: SelectedObjectsService,
                private editionLayerService: EditionLayerService,
                private dbService: DatabaseService
    ) {
        // Highlight the selected features
        this.selectedObjectsService.getFeatures()
            .subscribe((features) => {
                    // Update feature properties.
                    this.mapService.selection.list.forEach((feature) => {
                        feature.set('selected', false, true);
                        feature.set('visited', false, true);
                    });
                    features.forEach(feature => {
                        feature.set('selected', true, true);
                        feature.set('visited', false, true);
                    });

                    if (this.appLayer) {
                        this.appLayer.getLayers().forEach((layer) => {
                            (layer as VectorLayer<any>).getSource().changed();
                        });
                    }

                    this.mapService.selection.list = features;
                    this.mapService.selection.active = null;
                    if (this.editionLayerService.editionLayer) {
                        this.editionLayerService.editionLayer.getSource().dispatchEvent('change');
                    }
                }
            );

        this.dbService.removeDB$
            .subscribe({
                next: () => this.appLayer = null
            })
    }

    async init(): Promise<LayerGroup> {
        if (!this.appLayer) {
            this.appLayer = await this.createAppLayer();
        }
        return this.appLayer;
    }

    private async createAppLayer(): Promise<LayerGroup> {
        const promises: Promise<VectorLayer<any>>[] = [];
        const appLayers: FavoritesLayersModel[] = this.appLayersService.getFavorites();

        appLayers?.forEach(layerModel => {
            promises.push(this.createAppLayerInstance(layerModel));
        });
        const layers = await Promise.all(promises)

        const layerGroup = new LayerGroup({
            layers: layers,
        });
        layerGroup.set('name', 'Objects');
        this.mapLoadingSubject.complete();
        return layerGroup;
    }

    createAppLayerInstance(layerModel): Promise<VectorLayer<any>> {
        let olLayer: VectorLayer<any>;
        olLayer = new VectorLayer({
            visible: layerModel.visible,
            source: new VectorSource({ strategy: bbox })
        });
        olLayer.set('name', layerModel.title);
        olLayer.set('model', layerModel);

        if (layerModel.visible === true) {
            return this.setAppLayerFeatures(olLayer).then(() => Promise.resolve(olLayer));
        } else {
            return Promise.resolve(olLayer);
        }
    }

    setAppLayerFeatures(olLayer): Promise<any> {
        return new Promise(async resolve => {
            const layerModel = olLayer.get('model');
            const olSource = olLayer.getSource();
            // Try to get the promise of a previous query.
            let promise;
            switch (layerModel.filterValue) {
                case 'fr.sirs.core.model.TronconDigue':
                    // Get favorite selected Troncons
                    const keys = await this.getTronconsFavoritesIds();
                    promise = this.localDB.query('TronconDigue/streamLight', { keys })
                        .then(
                            (results) => {
                                return results.filter((item) => {
                                    return item.value.valid;
                                }).map(this.createAppFeatureModel.bind(this));
                            },
                            (error) => {
                                console.error(error);
                            }
                        );
                    break;
                case 'fr.sirs.core.model.BorneDigue':
                    // Get favorite selected Troncons
                    const tronconsFavoritesIds = await this.getTronconsFavoritesIds();
                    promise = this.localDB.query('getBornesFromTronconID', { keys: tronconsFavoritesIds }).then(
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
                    break;
                default:
                    if (PluginUtils.isDependanceAhClass(layerModel.filterValue) || PluginUtils.isVegetationClass(layerModel.filterValue)) {
                        promise = this.localDB.query('Element/byClassAndLinear', {
                            startkey: [layerModel.filterValue],
                            endkey: [layerModel.filterValue, {}],
                            include_docs: true
                        }).then(
                            (results) => {
                                return results.filter(item => item.doc.valid).map(this.createAppFeatureModel.bind(this));
                            },
                            (error) => {
                                console.error(error);
                            }
                        ).catch((error) => {
                            console.error(error);
                        });
                        //Specific case of troncon photo
                    } else if (layerModel.filterValue === 'fr.sirs.core.model.Photo' && layerModel.title === 'Photos des tronçons') {
                        // Get favorite selected Troncons
                        const keys = await this.getTronconsFavoritesIds();
                        promise = this.localDB.query('TronconDigue/streamLight', { keys }).then(
                            (results) => {
                                const collectPhotos = [];
                                results.map(obj => obj.value).forEach(troncon => {
                                    if (troncon.photos) {
                                        troncon.photos.forEach(photo => {
                                            if (photo.valid) {
                                                photo.parent = troncon._id;
                                                collectPhotos.push(photo);
                                            }
                                        });
                                    }
                                });
                                return collectPhotos.map(this.createAppFeatureModelFromObject.bind(this));
                            },
                            (error) => {
                                console.error(error);
                            }
                        );
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
                                () => [], error => console.error(error)
                            );
                        }
                    }

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

    private async getTronconsFavoritesIds() {
        const tmp = await this.storageService.getItem('AppTronconsFavorities');
        return !tmp ? [] : (tmp as Array<any>).map((item) => item.id);
    }

    private createAppFeatureModelFromObject(obj) {
        let dataProjection;

        if (!this.sirsDataService.sirsDoc) {
            dataProjection = 'EPSG:2154';
        } else {
            if (this.sirsDataService.sirsDoc.epsgCode) {
                dataProjection = this.sirsDataService.sirsDoc.epsgCode;
            } else {
                dataProjection = 'EPSG:2154';
            }
        }
        let projGeometry;
        let realGeometry;

        if (obj.geometry && obj['@class'] && (PluginUtils.isDependanceAhClass(obj['@class']) || PluginUtils.isVegetationClass(obj['@class']))) {
            projGeometry = this.wktFormat.readGeometry(obj.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });
            realGeometry = this.wktFormat.readGeometry(obj.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });
        } else {
            projGeometry = obj.geometry ? this.wktFormat.readGeometry(obj.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            }) : undefined;

            if (projGeometry instanceof LineString && projGeometry.getCoordinates().length === 2 &&
                projGeometry.getCoordinates()[0][0] === projGeometry.getCoordinates()[1][0] &&
                projGeometry.getCoordinates()[0][1] === projGeometry.getCoordinates()[1][1]) {
                projGeometry = new Point(projGeometry.getCoordinates()[0]);
            }

            realGeometry = obj.positionDebut ?
                this.wktFormat.readGeometry(obj.positionDebut, {
                    dataProjection,
                    featureProjection: 'EPSG:3857'
                }) : undefined;

            if (realGeometry && obj.positionFin && obj.positionFin !== obj.positionDebut) {
                realGeometry = new LineString([
                    realGeometry.getFirstCoordinate(),
                    (this.wktFormat.readGeometry(obj.positionFin, {
                        dataProjection,
                        featureProjection: 'EPSG:3857'
                    }) as Point).getFirstCoordinate()
                ]);
            }
        }

        return {
            id: obj.id || obj._id,
            rev: obj.rev || obj._rev,
            designation: obj.designation,
            title: obj.libelle,
            projGeometry,
            realGeometry,
            archive: !!obj.date_fin,
            parent: obj.parent
        };
    }

    createAppFeatureModel(featureDoc) {
        // depending on 'include_docs' option when querying docs
        const obj = featureDoc.doc || featureDoc.value;
        return this.createAppFeatureModelFromObject(obj);
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
                        feature.setStyle(this.realPositionStyle.style(this.mapService.selection,
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
                    feature.set('parent', featureModel.parent);
                    features.push(feature);
                } else {
                    // Show only not archived objects
                    if (!featureModel.archive) {
                        const feature = new Feature();
                        if (layerModel.realPosition) {
                            feature.setGeometry(featureModel.realGeometry);
                            feature.setStyle(this.realPositionStyle.style(this.mapService.selection,
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
                        feature.set('parent', featureModel.parent);
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

    private getAppLayerInstance(layerModel) {
        const layers = this.appLayer.getLayers().getArray();
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].get('model').title === layerModel.title) {
                return layers[i];
            }
        }
        return null;
    }

    async syncAppLayer(layerModel) {
        const olLayer = this.getAppLayerInstance(layerModel);
        if (olLayer) {
            olLayer.setVisible(layerModel.visible);
            (olLayer as VectorLayer<any>).getSource().clear();
            if (layerModel.visible === true) {
                await this.setAppLayerFeatures(olLayer);
            }
        }
    }

    clearAll() {
        this.appLayersService.getFavorites().forEach(
            (layer) => this.forceRefresh(layer)
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
        const element = collection.splice(from, 1)[0];
        collection.splice(to, 0, element);
    }

    addLabelFeatureLayer(layerModel) {
        const olLayer = this.getAppLayerInstance(layerModel);

        olLayer.get('model').featLabels = !olLayer.get('model').featLabels;
        (olLayer as VectorLayer<any>).getSource().clear();
        this.setAppLayerFeatures(olLayer);
    }

    reloadLayer(layerModel) {
        const olLayer = this.getAppLayerInstance(layerModel);

        // Load data if necessary.
        (olLayer as VectorLayer<any>).getSource().clear();
        this.setAppLayerFeatures(olLayer);
    }
}
