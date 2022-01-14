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
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.favorites = config.favorites;
                this.editionLayer = this.createEditionLayerInstance(this.favorites);
                this.editionLayer.setVisible(config.context.settings.edition);
            });
    }

    createEditionLayerInstance(favorites?: any[]) {
        const olLayer = new VectorLayer({
            name: 'Edition',
            model: {selectable: true},
            zIndex: 1000,
            source: new VectorSource({useSpatialIndex: false})
        });

        // Set the layer that contains the new objects of the edition mode
        this.setEditionLayerFeatures(olLayer, favorites).then();
        return olLayer;
    }

    updateEditionLayerInstance(favorites?: any[]) {
        this.editionLayer.getSource().clear();
        this.setEditionLayerFeatures(this.editionLayer, favorites);
    }

    setEditionLayerFeatures(olLayer, favorites?: any[]) {
        const olSource = olLayer.getSource();

        return this.localDB.query('objetsModeEdition5/objetsModeEdition5', {include_docs: true})
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
                        return;
                    } else {
                        olSource.clear();
                        olSource.addFeatures(this.createEditionFeatureInstances(results));
                        return;
                    }
                },
                (error) => {
                    console.error(error);
                    return;
                }
            );
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
        const SirsDoc = this.sirsDataService;
        let geometry;
        const dataProjection = (SirsDoc && SirsDoc.sirsDoc && SirsDoc.sirsDoc.epsgCode) ? SirsDoc.sirsDoc.epsgCode : 'EPSG:2154';

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
                    || (featureDoc.approximatePositionFin && (featureDoc.approximatePositionFin !== featureDoc.approximatePositionDebut)))) {
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
        this.setEditionLayerFeatures(this.editionLayer, favorites);
    }

    redrawEditionLayerAfterSynchronization() {
        this.editionLayer.getSource().clear();
        this.setEditionLayerFeatures(this.editionLayer);
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
