import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { SirsDocService } from './sirsdoc.service';
import { RealPositionStyle } from './style.service';
import { MapService } from './map.service';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import WKT from 'ol/format/WKT';
import { DatabaseService } from './database.service';
import { DatabaseModel } from '../components/database-connection/models/database.model';

@Injectable({
    providedIn: 'root'
})
export class EditionLayerService {
    editionLayer = null;
    favorites = [];

    wktFormat = new WKT();

    constructor(private localDB: LocalDatabase, 
                private SirsDoc: SirsDocService,
                private databaseService: DatabaseService,
                private realPositionService: RealPositionStyle, 
                private mapService: MapService) {
    }

    init() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.favorites = config.favorites;
                this.editionLayer = this.createEditionLayerInstance(this.favorites);
                this.editionLayer.setVisible(config.context.settings.edition);
            });
    }

    get getEditionLayer() {
        if (!this.editionLayer) {
            this.createEditionLayerInstance();
        } else {
            return this.editionLayer;
        }
    }

    createEditionLayerInstance(favorites?: any[]) {
        const olLayer = new VectorLayer({
            name: 'Edition',
            source: new VectorSource({useSpatialIndex: false})
        });

        this.setEditionLayerFeatures(olLayer, favorites); // Set the layer that contains the new objects of the edition mode
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
                    if (favorites && favorites.length>0) {
                        const visibleFeatures = [];
                        for (let fav of favorites) {
                            if (fav.visible) {
                                for (let obj of results) {
                                    if (fav.visible && fav.filterValue===obj.value['@class']) {
                                        visibleFeatures.push(obj);
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
                || (featureDoc.doc['@class'].toLowerCase().indexOf('dependance') > -1))) {
                features.push(this.createEditionFeatureInstance(featureDoc.doc));
            }
        });
        return features;
    }

    createEditionFeatureInstance(featureDoc): Feature {
        // Compute geometry.
        const SirsDoc = this.SirsDoc;
        let geometry = undefined;
        const dataProjection = (SirsDoc && SirsDoc.get() && SirsDoc.get().epsgCode) ? SirsDoc.get().epsgCode : 'EPSG:2154';

        if (featureDoc.geometry && featureDoc['@class'].toLowerCase().indexOf('dependance') > -1) {
            geometry = this.wktFormat.readGeometry(featureDoc.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });
        } else {
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

        const feature = new Feature({geometry});
        feature.setStyle(this.realPositionService.style(this.mapService.selection, feature, [0, 0, 255, 1], geometry.getType()));
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
        return this.editionLayer && this.editionLayer.getVisible();
    }

    changeVisibility(flag: boolean) {
        this.editionLayer.setVisible(flag);
    }
}
