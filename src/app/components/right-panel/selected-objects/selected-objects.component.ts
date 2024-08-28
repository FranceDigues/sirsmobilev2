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
import { EditObjectService } from "../../../services/edit-object.service";
import { OLService } from "@ionic-lib/lib-map/ol.service";
import LayerGroup from "ol/layer/Group";
import { Layer } from "ol/layer";
import { AppLayersService } from "../../../services/app-layers.service";
import { PluginUtils } from "../../../utils/plugin-utils";
import { Memoize, MemoizeExpiring } from "typescript-memoize";

@Component({
    selector: 'selected-objects',
    templateUrl: './selected-objects.component.html',
    styleUrls: ['./selected-objects.component.scss'],
})
export class SelectedObjectsComponent implements OnInit, OnDestroy {

    status: 'general' | 'details' = 'general';
    featuresCollection = [];
    subscription = null;
    filteredFeatures: any[] = [];
    filteredFeaturesCollection: any[] = [];
    types : string[];
    selectedType: string = ''; 
    searchTerm: string = '';
    constructor(private selectedObjectsService: SelectedObjectsService, private cdr: ChangeDetectorRef,
                private localDB: LocalDatabase,
                private appLayerService: AppLayersService,
                private objectDetails: ObjectDetails,
                private mapService: MapService,
                private mapManagerService: MapManagerService,
                private olService: OLService,
                private EOS: EditObjectService,
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
                this.filteredFeaturesCollection = this.featuresCollection ;
                this.filteredFeatures = this.selectedObjectsService.features;
                this.types= [];
                this.filteredFeatures.forEach(feat => {
                    const type = feat.get('@class').split(".")[4];
                    if (!this.types.some(t => t === type)) {
                      
                      this.types.push( type );
                    }
                    
                });
                
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

        this.getLayer(feature).then(layer => {
            this.EOS.selectedLayer = layer;


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
        })
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

    private async getLayer(feature: Feature) {
        const favorites = this.editionLayerService.favorites;

        for (const favorite of favorites) {
            if (favorite.filterValue === feature.get('@class')) {
                if (PluginUtils.isVegetationClass(feature.get('@class'))) {
                    const refs: any[] = await this.getVegetationRefs(feature.get('@class'));
                    const refIdx: number = refs.findIndex((ref) => ref._id === feature.get('typeVegetationId'));
                    if (refIdx === -1) {
                        console.error('Cannot find ref of vegetation', feature);
                        continue;
                    }
                    const layerName = refs[refIdx].libelle;
                    if (favorite.title === layerName) {
                        return favorite;
                    }
                } else {
                    return favorite;
                }
            }
        }

        return undefined;
    }


    @MemoizeExpiring(30000)
    private async getVegetationRefs(refName: string): Promise<any[]> {
        const classNameLastSegment = this.getLastClassSegment(refName);
        const refs = await this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.RefType' + classNameLastSegment],
            endkey: ['fr.sirs.core.model.RefType' + classNameLastSegment, {}],
            include_docs: true
        });

        return refs.map(elem => elem.doc);
    }

    @Memoize()
    private getLastClassSegment(className: string): string {
        const segments: string[] = className.split('.');
        return segments[segments.length - 1];
    }

    filterItems(event: any) {
        this.searchTerm = event.target.value.toLowerCase();
        this.applyFilters();
      }
    
    filterItemsByType(event: any) {
        this.selectedType = event.detail.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredFeatures = this.features.filter(feat => {
            const designation = feat.get('designation')?.toLowerCase() || '';
            const type = feat.get('@class')?.split(".")[4] || '';
            
            // Logique de filtrage
            const matchesSearchTerm = this.searchTerm ? designation.includes(this.searchTerm) : true;
            const matchesType = this.selectedType ? type === this.selectedType : true;

            return matchesSearchTerm && matchesType;
        });

        this.filteredFeaturesCollection = this.featuresCollection.filter(feat => {
            const designation = feat.get('designation')?.toLowerCase() || '';
            const type = feat.get('@class')?.split(".")[4] || '';

            // Logique de filtrage
            const matchesSearchTerm = this.searchTerm ? designation.includes(this.searchTerm) : true;
            const matchesType = this.selectedType ? type === this.selectedType : true;

            return matchesSearchTerm && matchesType;
        });
    }
}   
