import { Injectable } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { StorageService } from '@ionic-lib/lib-storage/storage.service';
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import Circle from 'ol/geom/Circle';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import Cluster from 'ol/source/Cluster';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { AppLayersService } from './app-layers.service';
import { BackLayerService } from './back-layer.service';
import { FeatureCache } from './cache.service';
import { DatabaseService } from './database.service';
import { MapService } from './map.service';
import { DatabaseModel, ListBackLayer } from '../components/database-connection/models/database.model';
import { SirsDocService } from './sirsdoc.service';
import { DefaultStyle, RealPositionStyle } from './style.service';
import { LocalDatabase } from './local-database.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GeolocLayer {
    geolocLayer: VectorLayer = null;

    // geolocLayer: VectorLayer = this.createGeolocLayer();

    init() {
        this.geolocLayer = this.createGeolocLayer();
    }

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
        const geolocLayerSource = this.getGeolocLayer.getSource();
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
                private ol: OLService, private dbService: DatabaseService,
                private webview: WebView) {
    }

    init() {
        this.backLayerService.init()
            .then(
                () => {
                    this.backLayer = this.createBackLayer();
                }
            );
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
        if (layerModel.source.type === 'OSM') {
            return new OSM(layerModel.source);
        } else if (layerModel.source.type === 'TileWMS') {
            return new TileWMS(layerModel.source);
        } else if (layerModel.source.type === 'XYZ') {
            return new XYZ(layerModel.source);
        } else {
            return new OSM({
                url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            });
        }
    }

    getUrl(url): string {
        return this.webview.convertFileSrc(url);
    }

    createBackLayerInstance(layerModel): TileLayer {
        let layer = null;
        if (typeof layerModel.cache === 'object' && layerModel.cache.active) {
            const extent = layerModel.cache.extent;

            const url = this.getUrl(layerModel.cache.url);
            const source = new XYZ({
                url
            });
            layer = new TileLayer({
                name: layerModel.name,
                extent,
                source
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
        if (layer !== this.backLayerService.backLayers.active) {
            this.backLayerService.backLayers.active = layer;
            this.updateBackLayerMap(layer);
            this.updateActiveBackLayerInHardDisk(layer);
        }
    }

    private updateActiveBackLayerInHardDisk(backLayer) {
        this.dbService.getCurrentDatabaseSettings()
            .then(
                (db: DatabaseModel) => {
                    db.context.backLayer.active = backLayer;
                    this.dbService.setCurrentDatabaseSettings(db);
                }
            );
    }

    updateBackLayerMap(layer: ListBackLayer) {
        this.backLayer.getLayers().setAt(0, this.createBackLayerInstance(layer));

        if (typeof layer.cache === 'object') {
            this.mapService.currentView.fit(layer.cache.extent, this.ol.map.getSize());
        }
    }

    syncBackLayer() {
        const olLayer = this.createBackLayerInstance(this.backLayerService.getActive());
        this.backLayer.getLayers().setAt(0, olLayer);
    }
}

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
                private SirsDoc: SirsDocService,
                private mapService: MapService, 
                private RealPositionStyle: RealPositionStyle,
                private DefaultStyle: DefaultStyle, 
                private appLayersService: AppLayersService) {
        // Make sur appLayer is initialized as it is heavily used.
        if (!this.appLayer) {
            this.init();
        };
    }

    init() {
        this.createAppLayer()
            .then(appLayer => {
                this.appLayer = appLayer;
            }, (error) => {
                console.error(error);
            });
    }

    createAppLayer() {
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
                        source: new VectorSource({useSpatialIndex: true})
                    })
                });

            } else {
                olLayer = new VectorLayer({
                    name: layerModel.title,
                    visible: layerModel.visible,
                    model: layerModel,
                    source: new VectorSource({useSpatialIndex: false})
                });
            }

            if (layerModel.visible === true) {
                this.setAppLayerFeatures(olLayer).then(response => {
                    resolve(olLayer);
                });
            }
            resolve(olLayer);
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
                // Get all the favorites tronçons ids
                const favorites = await this.storageService.getItem('AppTronconsFavorities');
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
                    );
                } else {
                    if (layerModel.filterValue.toLowerCase().indexOf('dependance') > -1) {
                        promise = this.localDB.query('Element/byClassAndLinear', {
                            startkey: [layerModel.filterValue],
                            endkey: [layerModel.filterValue, {}],
                            include_docs: true
                        }).then(
                            (results) => {
                                return results.filter((item) => {
                                    return !item.doc.editMode;
                                }).map(this.createAppFeatureModel);
                            },
                            (error) => {
                                console.error(error);
                            }
                        );
                    } else {
                        promise = new Promise((resolve2) => {
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
                const tmp = await this.storageService.getItem('AppTronconsFavorities');
                if (Array.isArray(tmp)) {
                    promise = this.localDB.query('TronconDigue/streamLight', {
                        keys: tmp === null ? [] : tmp.map((item) => {
                            return item.id;
                        })
                    }).then(
                        (results) => {
                            return results.map(this.createAppFeatureModel);
                        },
                        (error) => {
                            console.error(error);
                        });
                } else {
                    console.error('Error type');
                }
            } else {
                const tmp = await this.storageService.getItem('AppTronconsFavorities');
                if (Array.isArray(tmp)) {
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
                                }
                            ).then(
                                (results2) => {
                                    return results2.map(this.createAppFeatureModel.bind(this));
                                }
                            );
                        },
                        (error) => {
                            console.error(error);
                        });
                } else {
                    console.error('Error type');
                }
            }
            // Wait for promise resolution or rejection.
            promise.then(
                (featureModels) => {
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

    createAppFeatureModel(featureDoc) {
        // depending on 'include_docs' option when querying docs
        featureDoc = featureDoc.doc || featureDoc.value;
        let dataProjection;
        if (!this.SirsDoc.get()) {
            dataProjection = 'EPSG:2154'
        } else {
            if (this.SirsDoc.get().epsgCode) {
                dataProjection = this.SirsDoc.get().epsgCode;
            } else {
                dataProjection = 'EPSG:2154'
            }
        }
        let projGeometry;
        let realGeometry;

        if (featureDoc.geometry && featureDoc['@class'] && featureDoc['@class'].toLowerCase().indexOf('dependance') > -1) {
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
                        feature.setStyle(this.DefaultStyle.style(this.mapService.selection,
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
                            feature.setStyle(this.DefaultStyle.style(this.mapService.selection,
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
        layers.forEach((layer) => {
            const layerModel = layer.get('model');
            const olLayer = this.getAppLayerInstance(layerModel);

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
            if (layers[i].get('model') === layerModel) {
                return layers[i];
            }
        }
        return null;
    }

    syncAppLayer(layerModel) {
        const olLayer = this.getAppLayerInstance(layerModel);
        olLayer.setVisible(layerModel.visible);
        if (layerModel.filterValue === 'fr.sirs.core.model.BorneDigue') {
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

    moveAppLayer(from, to) {
        const collection = this.appLayer.getLayers().getArray();
        const tmp = collection[from];

        collection[from] = collection[to];
        collection[to] = tmp;
    }

    addLabelFeatureLayer(layerModel) {
        const olLayer = this.getAppLayerInstance(layerModel);
        olLayer.get('model').featLabels = !olLayer.get('model').featLabels;
        olLayer.getSource().clear();
        this.setAppLayerFeatures(olLayer);
    }

    reloadLayer(layerModel) {
        const olLayer = this.getAppLayerInstance(layerModel);
        // Load data if necessary.
        olLayer.getSource().clear();
        this.setAppLayerFeatures(olLayer);
    }

}
