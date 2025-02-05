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
import { Memoize } from "typescript-memoize";
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class MapManagerService {
    appLayer: LayerGroup = null;
    wktFormat = new WKT();
    public mapLoadingSubject = new Subject();

    private isDisplayUrgence = new BehaviorSubject<boolean>(false);
    public isUrgence = this.isDisplayUrgence.asObservable();

    urgenceDisplay: boolean;
    private UrgenceDisplaysubscription: Subscription;

    private filterUrgence = new BehaviorSubject<UrgenceLayerColors[]>([]);
    public filterDesordreToApply = this.filterUrgence.asObservable();

    filterUrgenceArray: UrgenceLayerColors[];
    private filterDesordreArraySubscription: Subscription;


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

        this.filterDesordreArraySubscription = this.filterDesordreToApply.subscribe(data => {
            this.filterUrgenceArray = data;
            });

        this.UrgenceDisplaysubscription = this.isUrgence.subscribe(value => {
            this.urgenceDisplay = value;
            });
        this.sirsDataService.getRefUrgence().then((list) => {
            list.forEach((item: any) => {
                UrgenceLayerColors["REF"+item.designation] = item.id;
                UrgenceLegendeDisplay[item.id]= item.abrege + ' - ' + item.libelle
              });
              
              this.populateUrgenceLayerColorsMap();
        }, (error) => {
            console.error('error ref urgence returned : ', error);
        });
    }
    private populateUrgenceLayerColorsMap() {
        const predefinedColors: { [key: string]: number[] } = {
          "RefUrgence:1": [255, 255, 0, 1],
          "RefUrgence:2": [255, 150, 0, 1],
          "RefUrgence:3": [255, 0, 0, 1],
          "RefUrgence:4": [180, 0, 250, 1],
          "RefUrgence:99": [255, 255, 255, 1]
        };
        
        Object.keys(UrgenceLayerColors).forEach(key => {
          if (predefinedColors[UrgenceLayerColors[key]]) {
            UrgenceLayerColorsMap[UrgenceLayerColors[key]] = predefinedColors[UrgenceLayerColors[key]];
          } else {
            UrgenceLayerColorsMap[UrgenceLayerColors[key]] = this.getRandomColor();
          }
        });
    }
    private getRandomColor(): number[] {
        return [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          1
        ];
    }

    public getUrgenceLayerColors(){
        return UrgenceLayerColors;
    }
    updateIsDiplayingUrgence(value: boolean) {
        this.isDisplayUrgence.next(value);
        if(!value){
            this.filterUrgence.next([]);
        }
    }

    updateIsDiplayingUrgence(value: boolean) {
        this.isDisplayUrgence.next(value);
        if(!value){
            this.filterUrgence.next([]);
        }
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

    public async setAppLayerFeatures(olLayer: VectorLayer<any>): Promise<any> {

        try {

            const layerModel = olLayer.get('model');
            const olSource = olLayer.getSource();
            let featureModels: any[];
         
            switch (layerModel.filterValue) {
                case 'fr.sirs.core.model.TronconDigue': {
                        const keys: any[] = await this.getTronconsFavoritesIds();
                        const results: any = await this.localDB.query('TronconDigue/streamLight', {keys});
                        featureModels = results.filter((item: any) => item.value.valid).map(this.createAppFeatureModel.bind(this));
                    }
                    break;

                case 'fr.sirs.core.model.BorneDigue': {
                        const tronconsFavoritesIds = await this.getTronconsFavoritesIds();
                        const results = await this.localDB.query('getBornesFromTronconID', {keys: tronconsFavoritesIds});
                        const results2 = await this.localDB.query('getBornesIdsHB', {keys: results.map((obj: any) => obj.value)});
                        featureModels = results2.map(this.createAppFeatureModel.bind(this));
                    }
                    break;

                default:
                    if (PluginUtils.isDependanceAhClass(layerModel.filterValue)) {

                        const results = await this.localDB.query('Element/byClassAndLinear', {
                            startkey: [layerModel.filterValue],
                            endkey: [layerModel.filterValue, {}],
                            include_docs: true
                        });
                        featureModels = results.filter(item => item.doc.valid).map(this.createAppFeatureModel.bind(this));

                    } else if(PluginUtils.isLitClass((layerModel.filterValue))){

                            const results = await this.localDB.query('Element/byClassAndLinear', {
                            startkey: [layerModel.filterValue],
                            endkey: [layerModel.filterValue, {}],
                            include_docs: true
                        });
                        featureModels = results.map(this.createAppFeatureModel.bind(this));
                    }
                    else if (PluginUtils.isVegetationClass(layerModel.filterValue)) {

                        const results = (await this.localDB.query('Element/byClassAndLinear', {
                            startkey: [layerModel.filterValue],
                            endkey: [layerModel.filterValue, {}],
                            include_docs: true
                        })).filter((item: any) => item.doc.valid);


                        const getLayerTitle = async (classNameLastSegment: string, typeVegetationId: string): Promise<string | undefined> => {
                            const refs = await this.localDB.query('Element/byClassAndLinear', {
                                startkey: ['fr.sirs.core.model.RefType' + classNameLastSegment],
                                endkey: ['fr.sirs.core.model.RefType' + classNameLastSegment, {}],
                                include_docs: true
                            });

                            for (const ref of refs) {
                                if (ref.doc._id === typeVegetationId) {
                                    return ref.doc.libelle;
                                }
                            }
                            return undefined;
                        }

                        const keepResultIfTitleMatch = async (result: any, title: string): Promise<any> => {
                            const classNameLastSegment = this.getLastClassSegment(result.doc['@class']);
                            const resultTitle = await getLayerTitle(classNameLastSegment, result.doc.typeVegetationId);
                            if (resultTitle === title) {
                                return result;
                            } else {
                                return undefined;
                            }
                        }

                        const featuresPromises: Promise<any>[] = results.map((result: any) => keepResultIfTitleMatch(result, olLayer.get('name')))

                        featureModels = (await Promise.all(featuresPromises))
                            .filter(elem => elem !== undefined)
                            .map(this.createAppFeatureModel.bind(this));

                    } else if (layerModel.filterValue === 'fr.sirs.core.model.Photo' && layerModel.title === 'Photos des tronçons') {

                        // Get favorite selected Troncons
                        const keys = await this.getTronconsFavoritesIds();
                        const results = await this.localDB.query('TronconDigue/streamLight', {keys});
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
                        featureModels = collectPhotos.map(this.createAppFeatureModelFromObject.bind(this));

                    } else {
                        // Get all the favorites tronçons ids
                        const favorites = await this.storageService.getItem('AppTronconsFavorities'); // TODO : that shit returns something null / empty. WHY ?!?!?§
                        const keys = [];
                        if (favorites !== null && Array.isArray(favorites) && favorites.length !== 0) {
                            
                            favorites.forEach((key) => {
                                keys.push([layerModel.filterValue, key.id]);
                            });
                            const results = await this.localDB.query('ElementSpecial3', {keys});

                            featureModels = results.map(this.createAppFeatureModel.bind(this));
       
                        } else {
                            featureModels = [];
                        }

                    }

            }

            olSource.addFeatures(this.createAppFeatureInstances(featureModels, layerModel));
            this.mapLoadingSubject.complete();

        } catch (e) {
            console.error(e);
            this.mapLoadingSubject.complete();
        }
    }

    @Memoize()
    private getLastClassSegment(className: string): string {
        const segments: string[] = className.split('.');
        return segments[segments.length - 1];
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
        let additionnalProperties = {};

        if (obj.geometry && obj['@class'] && (PluginUtils.isDependanceAhClass(obj['@class']) || PluginUtils.isVegetationClass(obj['@class']))) {
            projGeometry = this.wktFormat.readGeometry(obj.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });
            realGeometry = this.wktFormat.readGeometry(obj.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });

            if (PluginUtils.isVegetationClass(obj['@class'])) {
                additionnalProperties['typeVegetationId'] = obj['typeVegetationId'];
            }
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
            parent: obj.parent,
            ...additionnalProperties,
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
                        if(layerModel.filterValue ==="fr.sirs.core.model.Desordre" && this.urgenceDisplay && this.filterUrgenceArray.length > 0){
                            this.getLastDegreUrgence(featureModel.id).then(color => {
                                if (color && this.filterUrgenceArray && this.filterUrgenceArray.includes(color) ) {
                                    feature.setGeometry(featureModel.realGeometry);
                                    feature.setStyle(this.realPositionStyle.style(this.mapService.selection,
                                    feature, getColorByRefId(color), featureModel.realGeometry.getType(), featureModel, layerModel));
                                }
                            });
                        }else{
                            feature.setGeometry(featureModel.realGeometry);
                            feature.setStyle(this.realPositionStyle.style(this.mapService.selection,
                            feature, layerModel.color, featureModel.realGeometry.getType(), featureModel, layerModel));
                        }   
                    } else {
                        if(layerModel.filterValue ==="fr.sirs.core.model.Desordre" && this.urgenceDisplay && this.filterUrgenceArray.length > 0){
                            this.getLastDegreUrgence(featureModel.id).then(color => {
                                if (color && this.filterUrgenceArray && this.filterUrgenceArray.includes(color) ) {
                                    feature.setGeometry(featureModel.projGeometry);
                                    feature.setStyle(this.DefaultStyleService.style(this.mapService.selection,
                                    feature, getColorByRefId(color), featureModel.projGeometry.getType(), featureModel, layerModel));
                                }
                            });
                        }else{
                            feature.setGeometry(featureModel.projGeometry);
                            feature.setStyle(this.DefaultStyleService.style(this.mapService.selection,
                                feature, layerModel.color, featureModel.projGeometry.getType(), featureModel, layerModel));
                        }

                    }
                    feature.set('id', featureModel.id);
                    feature.set('categories', layerModel.categories);
                    feature.set('rev', featureModel.rev);
                    feature.set('designation', featureModel.designation);
                    feature.set('@class', layerModel.filterValue);
                    feature.set('title', featureModel.libelle);
                    feature.set('parent', featureModel.parent);

                    if (PluginUtils.isVegetationClass(layerModel.filterValue)) {
                        feature.set('typeVegetationId', featureModel['typeVegetationId']);
                    }

                    features.push(feature);
                } else {
                    // Show only not archived objects
                    if (!featureModel.archive) {
                        const feature = new Feature();
                        if (layerModel.realPosition) {
                            if(layerModel.filterValue ==="fr.sirs.core.model.Desordre" && this.urgenceDisplay && this.filterUrgenceArray.length > 0){
                                
                                this.getLastDegreUrgence(featureModel.id).then(color => {
                                    if (color && this.filterUrgenceArray && this.filterUrgenceArray.includes(color) ) {
                                        feature.setGeometry(featureModel.realGeometry);
                                        feature.setStyle(this.realPositionStyle.style(this.mapService.selection,
                                        feature, getColorByRefId(color), featureModel.realGeometry.getType(), featureModel, layerModel));
                                    }
                                });
                            }else{                                
                                feature.setGeometry(featureModel.realGeometry);
                                feature.setStyle(this.realPositionStyle.style(this.mapService.selection,
                                feature, layerModel.color, featureModel.realGeometry.getType(), featureModel, layerModel));
                            }   
                        } else {
                            if(layerModel.filterValue ==="fr.sirs.core.model.Desordre" && this.urgenceDisplay && this.filterUrgenceArray.length > 0){
                                this.getLastDegreUrgence(featureModel.id).then(color => {
                                    if (color && this.filterUrgenceArray && this.filterUrgenceArray.includes(color) ) {
                                        feature.setGeometry(featureModel.projGeometry);
                                        feature.setStyle(this.DefaultStyleService.style(this.mapService.selection,
                                        feature, getColorByRefId(color), featureModel.projGeometry.getType(), featureModel, layerModel));
                                    }
                                });
                            }else{
                                feature.setGeometry(featureModel.projGeometry);
                                feature.setStyle(this.DefaultStyleService.style(this.mapService.selection,
                                    feature, layerModel.color, featureModel.projGeometry.getType(), featureModel, layerModel));
                            }
                        }
                        feature.set('id', featureModel.id);
                        feature.set('categories', layerModel.categories);
                        feature.set('rev', featureModel.rev);
                        feature.set('designation', featureModel.designation);
                        feature.set('@class', layerModel.filterValue);
                        feature.set('title', featureModel.libelle);
                        feature.set('parent', featureModel.parent);

                        if (PluginUtils.isVegetationClass(layerModel.filterValue)) {
                            feature.set('typeVegetationId', featureModel['typeVegetationId']);
                        }

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

    /**
     * Get the urgency degree of the last Observation with a degrés d'urgence.
     */
    private getLastDegreUrgence(idDesordre: String): Promise<UrgenceLayerColors | null> {
        return this.getSOrtObservationByDesordreID(idDesordre)
        .then((obs: Observation[]) => {
            let lastUrgence: string | null = null;

            // Parcourir les observations pour trouver le dernier urgenceId non-null
            for (let i = 0; i < obs.length; i++) {
                const urgenceId = obs[i].urgenceId; 
                if (urgenceId !== null) {
                    lastUrgence = urgenceId;
                    break;
                }
            }

            // Retourner la couleur associée à l'urgenceId trouvé ou null si non trouvé
            return lastUrgence ? lastUrgence : null;
        })
        .catch(error => {
            console.error('Error fetching last degree of urgency:', error);
            return null; // Retourner null en cas d'erreur
        });    
    }

    /**
     * get all Observation of a specefic desordre !WARNING: SOME DESORDRE DO NOT HAVE OBSERVATION
     */
    private async getSOrtObservationByDesordreID(idDesordre: String): Promise<Observation[]>{
        const result = await this.localDB.get(idDesordre);
        const observations = result?.observations || [];
        if(observations.length > 0){
            observations.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
              });
        }
        return observations;

    }

    public updateUrgenceLayerColors(colors: UrgenceLayerColor[]) {
        this.filterUrgence.next(colors);
    }
}


export type Observation = {
    "@class": string;
    author: string;
    date: string;
    id: string;
    nombreDesordres: number;
    observateurId: string;
    suite: string;
    urgenceId: string;
    valid: boolean;
  };

export let UrgenceLayerColors: { [key: string]: string } = {};
export let UrgenceLayerColorsMap: { [key: string]: number[] } = {};
export let UrgenceLegendeDisplay: { [key: string]: string } = {};
// Function to get color by reference ID
export function getColorByRefId(refId: string): number[] {
    return UrgenceLayerColorsMap[refId as UrgenceLayerColors] ;
  }

export function getLegendByRefId(refId: string): number[] {
return UrgenceLegendeDisplay[refId as UrgenceLayerColors] ;
}

// export function get