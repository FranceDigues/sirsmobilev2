// @ts-nocheck

import { Injectable } from '@angular/core';
import { StorageService } from '@ionic-lib/lib-storage/storage.service';
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import LineString from 'ol/geom/LineString';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { bbox } from 'ol/loadingstrategy';
import { DatabaseModel } from '../components/database-connection/models/database.model';
import { PluginUtils } from '../utils/plugin-utils';
import { DatabaseService } from './database.service';
import { LocalDatabase } from './local-database.service';
import { MapService } from './map.service';
import { SirsDataService } from './sirs-data.service';
import { EditionLayerStyle } from './style.service';
import { AppTronconsService } from './troncon.service';

@Injectable({
    providedIn: 'root'
})
export class EditionLayerService {
    editionLayer = null;
    favorites = [];
    wktFormat = new WKT();

    constructor(private localDB: LocalDatabase,
        private sirsDataService: SirsDataService,
        private databaseService: DatabaseService,
        private editionLayerStyle: EditionLayerStyle,
        private storageService: StorageService,
        private mapService: MapService,
                private appTronconsService: AppTronconsService) {
        this.appTronconsService.updated
            .subscribe({
                next: () => {
                    if (this.editionLayer.getVisible()) {
                        console.log(this.editionLayer);
                        this.redrawEditionLayerAfterSynchronization();
                    }
                }
            });
    }

    async init() {
        const config: DatabaseModel = await this.databaseService.getCurrentDatabaseSettings() as DatabaseModel;
        this.favorites = config.favorites;
        this.editionLayer = this.createEditionLayerInstance();
        this.editionLayer.setVisible(config.context.settings.edition);
    }

    /** Call setEditionLayerFeatures after */
    createEditionLayerInstance() {
        return new VectorLayer({
            name: 'Edition',
            model: { selectable: true },
            zIndex: 1000,
            source: new VectorSource({ strategy: bbox })
        });
    }

    updateEditionLayerInstance(favorites?: any[]) {
        this.editionLayer.getSource().clear();
        this.setEditionLayerFeatures(this.editionLayer, favorites).then();
    }

    /*
    * Possibility to improve performances by update objectsModeEdition5 view by including selection by linearId
    * for classic element and another without for dependance/ah objects.
    */
    setEditionLayerFeatures(olLayer, favorites?: any[]) {
        const olSource = olLayer.getSource();
        olSource.clear();

        return new Promise(async (resolve) => {
            let editedObjects = await this.localDB.query('objetsModeEdition8/objetsModeEdition8', { include_docs: false });

            // Filter edited objects by the favorites selection of troncon
            const tronconFavorites: any = await this.storageService.getItem('AppTronconsFavorities');
            const tronconIds = tronconFavorites === null ? [] : tronconFavorites.map(t => t.id);
            editedObjects = editedObjects.filter(eo => {
                // TronconDigue cases
                if ('fr.sirs.core.model.TronconDigue' === eo.value['@class']) {
                    return tronconIds.indexOf(eo.id) > -1;
                    // All objects that have linearId attribute case
                } else if (eo.value.linearId) {
                    return  tronconIds.indexOf(eo.value.linearId) > -1;
                    // All other cases namely dependance/AH
                } else {
                    return true;
                }
            });

            // Photo treatment
            const editModePhotos = [];
            function extractPhotos() {
                editedObjects.forEach(obj => {
                    if ("fr.sirs.core.model.TronconDigue" === obj.value['@class'] && obj.value.photos) {
                        const trId = obj.id;
                        obj.value.photos.forEach(p => {
                            if (!p.valid) {
                                p.parent = trId;
                                editModePhotos.push(p);
                            }
                        });
                    }
                });
            }

            if (favorites && favorites.length > 0) {
                const visibleFeatures = [];

                for (const favorite of favorites) {
                    if (favorite.visible) {
                        if (favorite.title === 'Photos des tronçons') { //photo treatment
                            extractPhotos();
                        } else {
                            for (const obj of editedObjects) {
                                if (favorite.filterValue === obj.value['@class']) {
                                    visibleFeatures.push(obj);
                                }
                            }
                        }
                    }
                }
                olSource.addFeatures(this.createEditionFeatureInstances(visibleFeatures));
            } else {
                extractPhotos();
                olSource.addFeatures(this.createEditionFeatureInstances(editedObjects));
            }
            olSource.addFeatures(editModePhotos.map(p => this.createEditionFeatureInstancesFromPhoto(p))); //photo treatment
            resolve();
        });
    }

    createEditionFeatureInstances(featureDocs) {
        return featureDocs.reduce((features, featureDoc) => {
            if (featureDoc.value) features.push(this.createEditionFeatureInstance(featureDoc.value));
            return features;
        }, []);
    }

    createEditionFeatureInstancesFromPhotos(photoDocs) {
        return photoDocs.reduce((features, photoDoc) => {
            if (photoDoc.value) {
                const feature = this.createEditionFeatureInstancesFromPhoto(photoDoc.value);
                if (feature) features.push(feature);
                return features;
            } else {
                throw new Error('Unexpected behavior: photoDoc must have value');
            }
        }, []);
    }

    /**
     * return null if photoDoc does not have positionDebut or approximatePositionDebut attribut.
     * @param photoDoc
     */
    createEditionFeatureInstancesFromPhoto(photoDoc) {
        const dataProjection = this.sirsDataService.sirsDoc.epsgCode;
        let geometry = null;

        if (photoDoc.positionDebut) {
            geometry = this.wktFormat.readGeometry(photoDoc.positionDebut, { dataProjection, featureProjection: 'EPSG:3857' });
        } else if (photoDoc.approximatePositionDebut) {
            geometry = this.wktFormat.readGeometry(photoDoc.approximatePositionDebut, { dataProjection, featureProjection: 'EPSG:3857' });
        } else {
            return null;
        }
        return this.createFeatureFromPhoto(photoDoc, geometry);
    }

    createFeatureFromPhoto(photoDoc, geometry) {
        const feature = new Feature({ geometry });
        feature.setStyle(this.editionLayerStyle.style(this.mapService.selection, feature, geometry.getType()));
        feature.set('id', photoDoc.id);
        feature.set('author', photoDoc.author);
        feature.set('designation', photoDoc.designation);
        feature.set('@class', photoDoc['@class']);
        feature.set('parent', photoDoc.parent);
        return feature;
    }

    createEditionFeatureInstance(featureDoc): Feature {
        // Compute geometry.
        let geometry;
        const dataProjection = this.sirsDataService.sirsDoc.epsgCode;

        if (featureDoc.geometry && (PluginUtils.isDependanceAhClass(featureDoc['@class']) || PluginUtils.isVegetationClass(featureDoc['@class']) || featureDoc['@class'] === 'fr.sirs.core.model.TronconDigue')) {
            geometry = this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });
        } else {
            if (featureDoc.positionDebut || featureDoc.approximatePositionDebut) {
                geometry = this.wktFormat.readGeometry(
                    featureDoc.positionDebut ? featureDoc.positionDebut : featureDoc.approximatePositionDebut,
                    {
                        dataProjection,
                        featureProjection: 'EPSG:3857'
                    }
                );
                if (geometry && ((featureDoc.positionFin && (featureDoc.positionFin !== featureDoc.positionDebut))
                    || (featureDoc.approximatePositionFin
                        && (featureDoc.approximatePositionFin !== featureDoc.approximatePositionDebut)))) {
                    geometry = new LineString([
                        geometry.getFirstCoordinate(),
                        this.wktFormat.readGeometry(featureDoc.positionFin ? featureDoc.positionFin : featureDoc.approximatePositionFin,
                            {
                                dataProjection,
                                featureProjection: 'EPSG:3857'
                            }
                        ).getFirstCoordinate()
                    ]);
                }
            } else {
                // Calculate approximate position for objects without position
            }
        }

        const feature = new Feature({ geometry });
        if (geometry) {
            const style = featureDoc['@class'] === 'fr.sirs.core.model.TronconDigue' ?
                this.editionLayerStyle.tronconStyle() : this.editionLayerStyle.style(this.mapService.selection, feature, geometry.getType());
            feature.setStyle(style);
        }
        feature.set('id', featureDoc._id);
        feature.set('rev', featureDoc._rev);
        feature.set('author', featureDoc.author);
        feature.set('designation', featureDoc.designation);
        feature.set('@class', featureDoc['@class']);
        feature.set('edition', true);
        return feature;
    }

    redrawEditionModeLayer(layer, favorites?: any[]) {
        layer.getSource().clear();
        this.editionLayer = layer;
        this.setEditionLayerFeatures(this.editionLayer, favorites).then();
    }

    redrawEditionLayerAfterSynchronization() {
        this.editionLayer.getSource().clear();
        this.setEditionLayerFeatures(this.editionLayer).then();
    }

    isEnabled() {
        return new Promise((resolve, reject) => {
            this.databaseService.getCurrentDatabaseSettings()
                .then((config: DatabaseModel) => {
                    resolve(config.context.settings.edition);
                });
        });
    }

    changeVisibility(flag: boolean) {
        this.editionLayer.setVisible(flag);
    }
}
