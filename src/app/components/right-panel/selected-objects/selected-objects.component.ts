// @ts-nocheck

import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { SelectedObjectsService } from 'src/app/services/selected-objects.service';
import { LocalDatabase } from '../../../services/local-database.service';
import { ObjectDetails } from '../../../services/object-details.service';
import Feature from 'ol/Feature';
import { MapService } from "../../../services/map.service";
import { MapManagerService } from 'src/app/services/map-manager.service';
import { EditionLayerService } from '../../../services/edition-layer.service';
import VectorLayer from "ol/layer/Vector";

@Component({
    selector: 'selected-objects',
    templateUrl: './selected-objects.component.html',
    styleUrls: ['./selected-objects.component.scss'],
})
export class SelectedObjectsComponent implements OnInit, OnDestroy {

    status: 'general' | 'details' = 'general';
    featuresCollection = [];
    subscription = null;

    constructor(private selectedObjectsService: SelectedObjectsService, private cdr: ChangeDetectorRef,
                private localDB: LocalDatabase,
                private objectDetails: ObjectDetails,
                private mapService: MapService,
                private mapManagerService: MapManagerService,
                private editionLayerService: EditionLayerService) {
    }

    get features(): Array<Feature> {
        return this.selectedObjectsService.features;
    }

    ngOnInit() {
        this.subscription = this.selectedObjectsService.getFeatures()
            .subscribe((features) => {
                this.status = 'general';
                this.featuresCollection = this.getAllFeaturesFromCluster(features);
                this.cdr.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe(() => {
            this.selectedObjectsService.features = null;
            this.featuresCollection = null;
        });
    }

    getAllFeaturesFromCluster(features) {
        const res = [];

        features.forEach((feat) => {
            if (Array.isArray(feat.get('features'))) {
                feat.get('features').forEach((f) => {
                    res.push(f);
                });
            }
        });
        return res;
    }

    openDetails(feature) {
        feature.set('visited', true);
        this.mapService.selection.active = feature;
        //force refresh object data layers
        if (this.mapManagerService.appLayer !== null) {
            this.mapManagerService.appLayer.getLayers().forEach(layer => (layer as VectorLayer<any>).getSource().changed());
        }

        this.editionLayerService.editionLayer.getLayersArray().forEach(layer => layer.getSource().changed());

        //Layer of containment object
        if (feature.get('parent')) {
            this.localDB.get(feature.get('parent'))
                .then(
                    (doc) => {
                        for (const key in doc) {
                            const value = doc[key];
                            if (Array.isArray(value)) {
                                const found = value.find(innerDoc => innerDoc.id === feature.get('id'));
                                if (found) {
                                    //Only photos of troncons are supported for now.
                                    if (doc['@class'] === 'fr.sirs.core.model.TronconDigue' && found['@class'] === 'fr.sirs.core.model.Photo') {
                                        this.openPhotoTronconSuccess(doc, found);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                );
        } else {
            this.localDB.get(feature.get('id'))
                .then(
                    (doc) => {
                        this.openDocumentSuccess(doc);
                    }
                );
        }
    }

    changeStatus(path: 'general' | 'details') {
        this.status = path;
        this.cdr.detectChanges();
    }

    openDocumentSuccess(doc) {
        this.objectDetails.selectedObject = doc;
        this.status = 'details';
        this.cdr.detectChanges();
    }

    private openPhotoTronconSuccess(troncon, photo) {
        this.objectDetails.selectedObject = troncon;
        this.status = 'details';
        this.cdr.detectChanges();
        this.objectDetails.openPhotoDetails(photo);
    }

}
