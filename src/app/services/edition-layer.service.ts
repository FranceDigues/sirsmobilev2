import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { SirsDocService } from './sirsdoc.service';
import { AppConfigService } from './app-config.service';
import { RealPositionStyle } from './style.service';
import { MapService } from './map.service';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import WKT from 'ol/format/WKT';

@Injectable({
    providedIn: 'root'
})
export class EditionLayerService {
    editionLayer = null;

    wktFormat = new WKT();

    constructor(private localDB: LocalDatabase, private SirsDoc: SirsDocService,
                private appConfigService: AppConfigService,
                private realPositionService: RealPositionStyle, private mapService: MapService) {
    }

    init() {
        this.editionLayer = this.createEditionLayerInstance();
        this.editionLayer.setVisible(this.appConfigService.config.mode.enableEdition);
    }

    get getEditionLayer() {
        if (!this.editionLayer) {
            this.createEditionLayerInstance();
        } else {
            return this.editionLayer;
        }
    }

    createEditionLayerInstance() {
        const olLayer = new VectorLayer({
            name: 'Edition',
            source: new VectorSource({useSpatialIndex: false})
        });

        this.setEditionLayerFeatures(olLayer); // Set the layer that contains the new objects of the edition mode
        return olLayer;
    }

    setEditionLayerFeatures(olLayer) {
        const olSource = olLayer.getSource();

        return this.localDB.query('objetsModeEdition5/objetsModeEdition5', {include_docs: true})
            .then(
                (results) => {
                    olSource.clear();
                    olSource.addFeatures(this.createEditionFeatureInstances(results));
                    return;
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

    redrawEditionModeLayer(layer) {
        layer.getSource().clear();
        this.editionLayer = layer;
        this.setEditionLayerFeatures(this.editionLayer);
    }

    redrawEditionLayerAfterSynchronization() {
        this.editionLayer.getSource().clear();
        this.setEditionLayerFeatures(this.editionLayer);
    }

    isEnabled() {
        return this.appConfigService.config.mode.enableEdition;
    }

    changeVisibility(flag: boolean) {
        this.editionLayer.setVisible(flag);
    }
}
