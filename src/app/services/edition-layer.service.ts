import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { EditionLayerStyle } from './style.service';
import { MapService } from './map.service';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import WKT from 'ol/format/WKT';
import { DatabaseService } from './database.service';
import { DatabaseModel } from '../components/database-connection/models/database.model';
import { PluginUtils } from '../utils/plugin-utils';
import { SirsDataService } from './sirs-data.service';

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
                private mapService: MapService) {
        this.init().then();
    }

    init() {
        return new Promise((resolve) => {
            this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.favorites = config.favorites;
                this.createEditionLayerInstance(this.favorites).then(
                    (layer) => {
                        this.editionLayer = layer;
                        this.editionLayer.setVisible(config.context.settings.edition);
                        resolve();
                    }
                )
            });
        })
    }

    createEditionLayerInstance(favorites?: any[]) {
        return new Promise((resolve) => {
            const olLayer = new VectorLayer({
                name: 'Edition',
                model: {selectable: true},
                zIndex: 1000,
                source: new VectorSource({useSpatialIndex: false})
            });

            // Set the layer that contains the new objects of the edition mode
            this.setEditionLayerFeatures(olLayer, favorites).then(
                () => {
                    resolve(olLayer);
                }
            );
        })
    }

    updateEditionLayerInstance(favorites?: any[]) {
        this.editionLayer.getSource().clear();
        this.setEditionLayerFeatures(this.editionLayer, favorites).then();
    }

    setEditionLayerFeatures(olLayer, favorites?: any[]) {
        const olSource = olLayer.getSource();

        return new Promise((resolve, reject) => {
            this.localDB.query('objetsModeEdition5/objetsModeEdition5', {include_docs: true})
            .then(
                (results) => {
                    if (favorites && favorites.length > 0) {
                        const visibleFeatures = [];
                        for (const favorite of favorites) {
                            if (favorite.visible) {
                                for (const result of results) {
                                    if (favorite.visible && favorite.filterValue === result.value['@class']) {
                                        visibleFeatures.push(result);
                                    }
                                }
                            }
                        }
                        olSource.clear();
                        olSource.addFeatures(this.createEditionFeatureInstances(visibleFeatures));
                    } else {
                        olSource.clear();
                        olSource.addFeatures(this.createEditionFeatureInstances(results));
                    }
                    resolve();
                },
                (error) => {
                    console.error(error);
                    reject(error);
                }
            );
        });
    }

    createEditionFeatureInstances(featureDocs) {
        const features = [];
        featureDocs.forEach((featureDoc) => {
            if (featureDoc.doc && (featureDoc.doc.positionDebut || featureDoc.doc.approximatePositionDebut
                || PluginUtils.isDependanceAhClass(featureDoc.doc['@class']))) {
                features.push(this.createEditionFeatureInstance(featureDoc.doc));
            }
        });
        return features;
    }

    createEditionFeatureInstance(featureDoc): Feature {
        // Compute geometry.
        let geometry;
        const dataProjection = this.sirsDataService.sirsDoc.epsgCode;

        if (featureDoc.geometry && PluginUtils.isDependanceAhClass(featureDoc['@class'])) {
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

        const feature = new Feature({geometry});
        feature.setStyle(this.editionLayerStyle.style(this.mapService.selection, feature, geometry.getType()));
        feature.set('id', featureDoc._id);
        feature.set('rev', featureDoc._rev);
        feature.set('author', featureDoc.author);
        feature.set('description', featureDoc.description);
        feature.set('designation', featureDoc.designation);
        feature.set('@class', featureDoc['@class']);

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
