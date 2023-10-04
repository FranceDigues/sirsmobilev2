// @ts-nocheck

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '@ionic-lib/lib-storage/storage.service';
import { LoadingController, ToastController } from '@ionic/angular';
import WKT from 'ol/format/WKT';
import { transform } from 'ol/proj';
import { getDistance } from 'ol/sphere';
import { DatabaseService } from './database.service';
import { EditionModeService } from './edition-mode.service';
import { GeolocationService } from './geolocation.service';
import { UuidUtils as uuid } from '../utils/uuid-utils';
import { PositionService } from './position.service';
import { DatabaseModel } from '../components/database-connection/models/database.model';
import { PluginUtils } from '../utils/plugin-utils';
import { SirsDataService } from './sirs-data.service';
import { LocalDatabase } from './local-database.service';
import Point from "ol/geom/Point";

@Injectable({
    providedIn: 'root'
})
export class EditObjectService {

    wktFormat = new WKT();
    type = '';
    isNew = true;
    tab = 'fields';
    view = 'form';
    designation = '';
    objectDoc = null;
    isLinear = false;
    objDependanceType = null;
    objVegetationType = null;
    dependances = [];
    amenagementHydrauliques = [];
    linearPosEditionHandler = {
        startPoint: false,
        endPoint: false
    };
    showTextConfig;
    troncons = [];
    plans = [];
    parcelles = [];
    allTroncons = [];
    geoloc = undefined;
    refs = null;
    dateWrapper = null;
    objectType = null;
    dataProjection = this.sirsDataService.sirsDoc.epsgCode;
    startPosBorneLabel: Promise<string> | string | null = null;
    endPosBorneLabel: Promise<string> | string | null = null;
    isClosed;
    selectedLayer;

    constructor(private databaseService: DatabaseService,
                private loadingCtrl: LoadingController,
                private sirsDataService: SirsDataService,
                private editionModeService: EditionModeService,
                private route: Router,
                private toastCtrl: ToastController,
                private geolocationService: GeolocationService,
                private positionService: PositionService,
                private storageService: StorageService,
                private localDB: LocalDatabase) {
    }

    init(type, id) {
        return new Promise(async (resolve) => {
            const loading = await this.loadingCtrl.create({ message: 'Chargement' });
            await loading.present();

            this.resetValues();
            this.type = type;
            this.isNew = !(id && id !== '');

            if (this.isNew) {
                this.objectDoc = this.editionModeService.newObject(type);
            } else {
                this.objectDoc = await this.localDB.get(id);
            }

            // Hack for borne fin data without borneFinId
            if (typeof (this.objectDoc.borne_fin_aval) !== 'undefined'
                && typeof (this.objectDoc.borne_fin_distance) !== 'undefined'
                && !this.objectDoc.borneFinId) {
                this.objectDoc.borneFinId = this.objectDoc.borneDebutId;
                this.objectDoc.borne_fin_aval = this.objectDoc.borne_debut_aval;
                this.objectDoc.borne_fin_distance = this.objectDoc.borne_debut_distance;
            }

            this.objectType = PluginUtils.doc2Class(this.objectDoc);
            this.isClosed = (!!this.objectDoc.positionFin || !!this.objectDoc.geometry || !!this.objectDoc.borneFinId);

            await this.initReferences();
            this.initTronconList();
            if (this.isDependance()) await this.initDependance();
            if (this.isVegetation()) await this.initVegetation();
            if (this.isParcelleVegetation()) await this.initPlansList();
            await this.initStartPosBorne();
            await this.initEndPosBorne();
            this.initIsLinear();

            await this.databaseService.getCurrentDatabaseSettings()
                .then((config: DatabaseModel) => {
                    this.showTextConfig = config.context.showText;
                    return Promise.resolve();
                });

            await loading.dismiss();
            resolve();
        });
    }

    resetValues() {
        this.type = '';
        this.isNew = true;
        this.tab = 'fields';
        this.view = 'form';
        this.designation = '';
        this.objectDoc = null;
        this.isLinear = false;
        this.objDependanceType = null;
        this.objVegetationType = null;
        this.dependances = [];
        this.amenagementHydrauliques = [];
        this.linearPosEditionHandler = {
            startPoint: false,
            endPoint: false
        };
        this.showTextConfig = null;
        this.troncons = [];
        this.plans = [];
        this.parcelles = [];
        this.allTroncons = [];
        this.geoloc = undefined;
        this.refs = null;
        this.dateWrapper = null;
        this.objectType = null;
        this.dataProjection = this.sirsDataService.sirsDoc.epsgCode;
        this.startPosBorneLabel = null;
        this.endPosBorneLabel = null;
    }

    showText(type) {
        return this.showTextConfig === type;
    }

    formatDate() {
        const date = new Date(this.dateWrapper);
        this.objectDoc.date_fin = date.toISOString().split('T')[0];
    }

    watchDocPositionDebut() { // ! call this instead changing value alone
        const newValue = this.objectDoc.positionDebut;
        if (typeof newValue !== 'undefined') {
            this.troncons = this.calculateDistanceObjectTroncon(
                newValue,
                this.allTroncons
            );
        } else {
            this.troncons = this.allTroncons;
        }
        if (this.troncons.length === 1) {
            this.objectDoc.linearId = this.troncons[0].id;
        }
    }

    watchDocPositionFin() { // ! call this instead changing value alone
        const newValue = this.objectDoc.positionFin;
        if (typeof newValue !== 'undefined') {
            this.troncons = this.calculateDistanceObjectTroncon(
                newValue,
                this.allTroncons
            );
        } else {
            this.troncons = this.allTroncons;
        }
        if (this.troncons.length === 1) {
            this.objectDoc.linearId = this.troncons[0].id;
        }
    }

    calculateDistanceObjectTroncon(point, list) {
        const nearTronconList = [];
        // geomatryPosition is instance of ol.geom.Point
        const geomatryPosition = new WKT().readGeometry(point, {
            dataProjection: this.sirsDataService.sirsDoc.epsgCode,
            featureProjection: 'EPSG:3857'
        });

        const positionCoord = (geomatryPosition as Point).getCoordinates();
        let geom = null;
        let geomTronc = null;
        // Get of the LineStrings from the list of Troncons
        list.forEach((elt) => {
            try {
                geom = new WKT().readGeometry(elt.geometry, {
                    dataProjection: this.sirsDataService.sirsDoc.epsgCode,
                    featureProjection: 'EPSG:3857'
                });
            } catch (e) {
                console.error(e);
            }
            geomTronc = geom.getClosestPoint(positionCoord);
            // Calculate the distance between two point

            // The distance
            const dist = getDistance(transform(positionCoord, 'EPSG:3857', 'EPSG:4326'),
                transform(geomTronc, 'EPSG:3857', 'EPSG:4326'), 6378137) / 1000;
            if (dist <= 1) {
                nearTronconList.push(elt);
            }
        });
        // The list of the nearest Troncons
        return nearTronconList;
    }

    setupRef(field, defaultRef, isMultiple?) {
        if (typeof this.objectDoc[field] !== 'undefined') {
            return;
        }
        if (typeof defaultRef === 'object') {
            this.objectDoc[field] = isMultiple ? [defaultRef.id] : defaultRef.id;
        } else {
            this.objectDoc[field] = isMultiple ? [] : undefined;
        }
    }

    createMeasure() {
        let defaultRef = this.refs.RefReferenceHauteur[0];
        return {
            _id: uuid.generateUuid(),
            '@class': 'fr.sirs.core.model.MesureMonteeEaux',
            date: new Date().toISOString(),
            referenceHauteurId: defaultRef ? defaultRef.id : undefined,
            hauteur: 0
        };
    }

    isDependance() {
        return PluginUtils.isDependanceAhClass(this.objectDoc['@class']);
    }

    isVegetation() {
        return PluginUtils.isVegetationClass(this.objectDoc['@class']);
    }

    isParcelleVegetation() {
        return PluginUtils.isParcelleVegetationClass(this.objectDoc['@class']);
    }

    private async initReferences() {
        const refs = await this.editionModeService.getReferenceTypes();
        const res = {};
        for (const ref of refs) { //need to do this bcs Promis.all accepts only array on parameter and not object
            res[ref[0]] = ref[1];
        }
        this.refs = res;
    }

    initTronconList() {
        this.storageService.getItem('AppTronconsFavorities')
            .then(
                (value) => {
                    if (Array.isArray(value)) {
                        this.troncons = value;
                        this.allTroncons = value;
                    } else {
                        console.error('WRONG TYPE: AppTronconsFavorites item from StorageService: ' + JSON.stringify(value));
                    }
                }
            );
    }

    async initPlansList() {
        this.plans = await this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.PlanVegetation'],
            endkey: ['fr.sirs.core.model.PlanVegetation', {}],
            include_docs: false
        });
    }

    private async initDependance() {
        //Dependance or AH don't have linearId.
        delete this.objectDoc.linearId;

        //Determines the type of geometry
        if (!this.objectDoc.geometry) {
            this.objDependanceType = 'point';
        } else if (this.objectDoc.geometry.toUpperCase().indexOf('POLYGON') > -1 || this.objectDoc.geometry.toUpperCase().indexOf('MULTIPOLYGON') > -1) {
            this.objDependanceType = 'polygon';
        } else if (this.objectDoc.geometry.toUpperCase().indexOf('POINT') > -1 || this.objectDoc.geometry.toUpperCase().indexOf('MULTIPOINT') > -1) {
            this.objDependanceType = 'point';
        } else {
            this.objDependanceType = 'line';
        }

        //Collect initialization requests for AH and depandence
        const promises = [];
        if (this.objectDoc['@class'] === 'fr.sirs.core.model.DesordreDependance') {
            promises.push(this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.CheminAccesDependance'],
                    endkey: ['fr.sirs.core.model.CheminAccesDependance', {}],
                    include_docs: true
                }),
                this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.OuvrageVoirieDependance'],
                    endkey: ['fr.sirs.core.model.OuvrageVoirieDependance', {}],
                    include_docs: true
                }),
                this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.AutreDependance'],
                    endkey: ['fr.sirs.core.model.AutreDependance', {}],
                    include_docs: true
                }),
                this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.AireStockageDependance'],
                    endkey: ['fr.sirs.core.model.AireStockageDependance', {}],
                    include_docs: true
                })
            );
        }
        if (this.objectDoc['@class'] === 'fr.sirs.core.model.DesordreDependance' ||
            this.objectDoc['@class'] === 'fr.sirs.core.model.PrestationAmenagementHydraulique' ||
            this.objectDoc['@class'] === 'fr.sirs.core.model.OuvrageAssocieAmenagementHydraulique' ||
            this.objectDoc['@class'] === 'fr.sirs.core.model.StructureAmenagementHydraulique' ||
            this.objectDoc['@class'] === 'fr.sirs.core.model.OrganeProtectionCollective') {
            promises.push(this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                startkey: ['fr.sirs.core.model.AmenagementHydraulique'],
                endkey: ['fr.sirs.core.model.AmenagementHydraulique', {}],
                include_docs: true
            }));
        }
        const dependanceAndAH = await Promise.all(promises);
        await new Promise(resolve => {
            setTimeout(() => {
                if (dependanceAndAH.length === 1) {
                    this.amenagementHydrauliques.push(...(dependanceAndAH[0].rows.map(elt => elt)));
                }
                if (dependanceAndAH.length >= 4) {
                    this.dependances.push(
                        ...(dependanceAndAH[0].rows.map(elt => elt)),
                        ...(dependanceAndAH[1].rows.map(elt => elt)),
                        ...(dependanceAndAH[2].rows.map(elt => elt)),
                        ...(dependanceAndAH[3].rows.map(elt => elt)));
                }
                if (dependanceAndAH.length === 5) {
                    this.amenagementHydrauliques.push(...(dependanceAndAH[4].rows.map(elt => elt)));
                }
                resolve();
            }, 100);
        })
    }

    private async initVegetation() {
        //Determines the type of geometry
        if (this.objectDoc['@class'] !== 'fr.sirs.core.model.ArbreVegetation') {
            this.objVegetationType = 'polygon';
        } else {
            this.objVegetationType = 'point';
        }

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                this.localDB.query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.ParcelleVegetation'],
                    endkey: ['fr.sirs.core.model.ParcelleVegetation', {}],
                    include_docs: false
                }).then(
                    (results) => {
                        this.parcelles = results;
                        resolve();
                    }, (error) => {
                        console.error(error);
                        reject(error);
                    });
            }, 100);
        })
    }

    save() {
        if (!this.isDependance() && !this.isVegetation()) {
            if (!this.objectDoc.linearId) {
                this.messageErrorHandler('Veuillez choisir un tronçon de rattachement pour cet objet');
                return;
            }

            if (!this.objectDoc.positionDebut && !this.objectDoc.borneDebutId) {
                this.messageErrorHandler('Veuillez choisir une position pour cet objet, avant de continuer');
                return;
            }
        }

        if (this.isDependance() && !this.objectDoc.geometry) {
            this.messageErrorHandler('Veuillez choisir une position pour cet objet, avant de continuer');
            return;
        }

        if (this.isVegetation()) {
            if (!this.objectDoc.geometry && !this.objectDoc.positionDebut && !this.objectDoc.positionDebut) {
                this.messageErrorHandler('Veuillez choisir une position pour cet objet, avant de continuer');
                return;
            }
        }

        // Add the source of the Desordre
        if (this.objectDoc['@class'] === 'fr.sirs.core.model.Desordre') {
            this.objectDoc['sourceId'] = 'RefSource:4';
        }

        // Invalid the document
        this.objectDoc.valid = false;

        // Update date
        this.objectDoc.dateMaj = new Date().toISOString().split('T')[0];

        delete this.objectDoc.prDebut;

        delete this.objectDoc.prFin;

        if (this.isNew) {
            this.editionModeService.createObject(this.objectDoc).then(
                () => {
                    this.route.navigateByUrl('/main').then();
                });
        } else {
            this.editionModeService.updateObject(this.objectDoc).then(
                () => {
                    this.route.navigateByUrl('/main').then();
                });
        }
    }

    private messageErrorHandler(msg: string) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then((toast) => {
            toast.present().then();
        });
    }

    handlePos(pos, posEnd?) {
        delete this.objectDoc.systemeRepId;
        delete this.objectDoc.borne_debut_aval;
        delete this.objectDoc.borne_debut_distance;
        delete this.objectDoc.borneDebutId;
        delete this.objectDoc.borne_fin_aval;
        delete this.objectDoc.borne_fin_distance;
        delete this.objectDoc.borneFinId;
        delete this.objectDoc.borneDebutLibelle;
        delete this.objectDoc.borneFinLibelle;
        delete this.objectDoc.approximatePositionDebut;
        delete this.objectDoc.approximatePositionFin;

        this.objectDoc.editedGeoCoordinate = true;

        const coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);

        // Point case
        if (!this.isLinear) {
            this.objectDoc.positionDebut = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
            this.objectDoc.positionFin = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
            this.watchDocPositionDebut();
        } else {
            // Linear case
            if (posEnd) {
                let coordinateEnd = transform([posEnd.longitude, posEnd.latitude], 'EPSG:4326', this.dataProjection);
                this.objectDoc.positionDebut = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
                this.objectDoc.positionFin = 'POINT(' + coordinateEnd[0] + ' ' + coordinateEnd[1] + ')';
                this.linearPosEditionHandler.startPoint = false;
                this.linearPosEditionHandler.endPoint = false;
                this.watchDocPositionDebut();
            } else {
                if (this.linearPosEditionHandler.startPoint) {
                    this.objectDoc.positionDebut = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
                    this.watchDocPositionDebut();
                    this.linearPosEditionHandler.startPoint = false;
                    if (!this.objectDoc.positionFin) {
                        this.objectDoc.positionFin = this.objectDoc.positionDebut;
                    }
                }
                if (this.linearPosEditionHandler.endPoint) {
                    this.objectDoc.positionFin = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
                    this.linearPosEditionHandler.endPoint = false;
                    if (!this.objectDoc.positionDebut) {
                        this.objectDoc.positionDebut = this.objectDoc.positionFin;
                        this.watchDocPositionDebut();
                    }
                }
            }
        }
    }

    handlePosDependance(pos) {
        delete this.objectDoc.systemeRepId;
        delete this.objectDoc.borne_debut_aval;
        delete this.objectDoc.borne_debut_distance;
        delete this.objectDoc.borneDebutId;
        delete this.objectDoc.borne_fin_aval;
        delete this.objectDoc.borne_fin_distance;
        delete this.objectDoc.borneFinId;
        delete this.objectDoc.borneDebutLibelle;
        delete this.objectDoc.borneFinLibelle;
        delete this.objectDoc.approximatePositionDebut;
        delete this.objectDoc.approximatePositionFin;
        delete this.objectDoc.positionDebut;
        this.watchDocPositionDebut();
        delete this.objectDoc.positionFin;

        let coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);
        // Point case
        if (this.objDependanceType === 'point') {
            this.objectDoc.geometry = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
        } else {
            // Linear case
            if (this.objectDoc.geometry && this.objectDoc.geometry.toUpperCase().indexOf('LINESTRING') > -1) {
                let geometry = this.wktFormat.readGeometry(this.objectDoc.geometry);

                (geometry as Point).setCoordinates([coordinate, (geometry as Point).getLastCoordinate()]);

                this.objectDoc.geometry = this.wktFormat.writeGeometry(geometry);
            } else {
                this.objectDoc.geometry = 'LINESTRING(' + coordinate[0] + ' ' + coordinate[1] + ')';
            }
        }
    }

    handlePosDependanceEnd(pos) {
        delete this.objectDoc.systemeRepId;
        delete this.objectDoc.borne_debut_aval;
        delete this.objectDoc.borne_debut_distance;
        delete this.objectDoc.borneDebutId;
        delete this.objectDoc.borne_fin_aval;
        delete this.objectDoc.borne_fin_distance;
        delete this.objectDoc.borneFinId;
        delete this.objectDoc.borneDebutLibelle;
        delete this.objectDoc.borneFinLibelle;
        delete this.objectDoc.approximatePositionDebut;
        delete this.objectDoc.approximatePositionFin;
        delete this.objectDoc.positionDebut;
        this.watchDocPositionDebut();
        delete this.objectDoc.positionFin;

        let coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);

        let geometry = this.wktFormat.readGeometry(this.objectDoc.geometry);

        (geometry as Point).setCoordinates([(geometry as Point).getFirstCoordinate(), coordinate]);

        this.objectDoc.geometry = this.wktFormat.writeGeometry(geometry);
    }

    handlePosByBorne(data) {
        delete this.objectDoc.positionDebut;
        this.watchDocPositionDebut();
        delete this.objectDoc.positionFin;
        delete this.objectDoc.geometry;
        delete this.objectDoc.longitudeMin;
        delete this.objectDoc.longitudeMax;
        delete this.objectDoc.latitudeMin;
        delete this.objectDoc.latitudeMax;
        delete this.objectDoc.geometryMode;
        this.objectDoc.editedGeoCoordinate = false;

        // Point case
        if (!this.isLinear) {
            this.objectDoc.systemeRepId = data.systemeRepId;
            this.objectDoc.borne_debut_aval = data.borne_debut_aval === 'true';
            this.objectDoc.borne_debut_distance = data.borne_debut_distance;
            this.objectDoc.borneDebutId = data.borneDebutId;
            this.objectDoc.approximatePositionDebut = data.approximatePositionDebut;
            this.objectDoc.borneDebutLibelle = data.borneDebutLibelle;
            this.objectDoc.borne_fin_aval = data.borne_debut_aval === 'true';
            this.objectDoc.borne_fin_distance = data.borne_debut_distance;
            this.objectDoc.borneFinId = data.borneDebutId;
            this.objectDoc.borneFinLibelle = data.borneDebutLibelle;
            this.objectDoc.approximatePositionFin = data.approximatePositionDebut;
            this.initStartPosBorne();
        } else {
            this.objectDoc.systemeRepId = data.systemeRepId;
            this.objectDoc.borne_debut_aval = data.borne_debut_aval === 'true';
            this.objectDoc.borne_fin_aval = data.borne_fin_aval === 'true';
            this.objectDoc.borne_debut_distance = data.borne_debut_distance;
            this.objectDoc.borne_fin_distance = data.borne_fin_distance;
            this.objectDoc.borneDebutId = data.borneDebutId;
            this.objectDoc.borneFinId = data.borneFinId;
            this.linearPosEditionHandler.startPoint = false;
            this.linearPosEditionHandler.endPoint = false;
            this.objectDoc.borneDebutLibelle = data.borneDebutLibelle;
            this.objectDoc.borneFinLibelle = data.borneFinLibelle;
            this.objectDoc.approximatePositionDebut = data.approximatePositionDebut;
            this.objectDoc.approximatePositionFin = data.approximatePositionFin;
            this.initStartPosBorne();
            this.initEndPosBorne();
        }
    }

    changeObjectType() {
        if (this.isLinear) {
            delete this.objectDoc.positionFin;
            delete this.objectDoc.approximatePositionFin;
        } else {
            this.objectDoc.positionFin = this.objectDoc.positionDebut;
            this.objectDoc.approximatePositionFin = this.objectDoc.approximatePositionDebut;
        }
    }

    changeObjectTypeDependance() {
        if (this.objDependanceType === 'line') {
            delete this.objectDoc.positionFin;
            delete this.objectDoc.approximatePositionFin;
        } else if (this.objDependanceType === 'point') {
            this.objectDoc.positionFin = this.objectDoc.positionDebut;
            this.objectDoc.approximatePositionFin = this.objectDoc.approximatePositionDebut;
        } else {
            delete this.objectDoc.positionFin;
            delete this.objectDoc.positionDebut;
            this.watchDocPositionDebut();
            delete this.objectDoc.approximatePositionFin;
            delete this.objectDoc.approximatePositionDebut;
        }
        delete this.objectDoc.geometry;
    }

    changeObjectTypeVegetation() {
        if (this.objVegetationType === 'line') {
            delete this.objectDoc.positionFin;
            delete this.objectDoc.approximatePositionFin;
        } else if (this.objVegetationType === 'point') {
            this.objectDoc.positionFin = this.objectDoc.positionDebut;
            this.objectDoc.approximatePositionFin = this.objectDoc.approximatePositionDebut;
        } else {
            delete this.objectDoc.positionFin;
            delete this.objectDoc.positionDebut;
            this.watchDocPositionDebut();
            delete this.objectDoc.approximatePositionFin;
            delete this.objectDoc.approximatePositionDebut;
        }
        delete this.objectDoc.geometry;
    }

    getStartPos() {
        if (this.objectDoc.positionDebut) {
            let coordinates = this.positionService.getLatLongFromWKT(this.objectDoc.positionDebut);
            return this.roundGPSCoordinate(coordinates[0]) + ", " + this.roundGPSCoordinate(coordinates[1]);
        } else {
            return undefined;
        }
    }

    getEndPos() {
        if (this.objectDoc.positionFin) {
            let coordinates = this.positionService.getLatLongFromWKT(this.objectDoc.positionFin);
            return this.roundGPSCoordinate(coordinates[0]) + ", " + this.roundGPSCoordinate(coordinates[1]);
        } else {
            return undefined;
        }
    }

    initStartPosBorne() {
        if (this.objectDoc.borneDebutId) {
            return new Promise<string>((resolve) => {
                this.databaseService.getLocalDB().get(this.objectDoc.borneDebutId)
                    .then(results => {
                        const borneLabel = this.findBorneLabel(results);
                        const res = this.objectDoc.borneDebutId ?
                            `à ${Math.round(this.objectDoc.borne_debut_distance)} m en ${(this.objectDoc.borne_debut_aval ? 'amont' : 'aval')} de la borne ${borneLabel}` : 'à définir';
                        this.startPosBorneLabel = res;
                        resolve(res);
                    });
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    findBorneLabel(results) {
        const defaultText = `avec l'id : ${this.objectDoc.borneDebutId}`;
        if (results) {
            if (results.libelle) {
                return results.libelle;
            } else if (results.value) {
                return results.value.libelle || defaultText;
            } else {
                return defaultText;
            }
        } else {
            return defaultText;
        }
    }

    initEndPosBorne() {
        if (this.objectDoc.borneFinId) {
            return new Promise<string>((resolve) => {
                this.databaseService.getLocalDB().get(this.objectDoc.borneFinId)
                    .then(result => {
                        const borneLabel = this.findBorneLabel(result);
                        const res = this.objectDoc.borneFinId ?
                            `à ${Math.round(Math.round(this.objectDoc.borne_fin_distance))} m en ${(this.objectDoc.borne_fin_aval ? 'amont' : 'aval')} de la borne ${borneLabel}` : 'à définir';
                        this.endPosBorneLabel = res;
                        resolve(res);
                    });
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    getStartPosDependance() {
        if (this.objectDoc.geometry) {
            let coordinates = this.positionService.getLatLongFromWKT(this.objectDoc.geometry);
            return this.roundGPSCoordinate(coordinates[0]) + ", " + this.roundGPSCoordinate(coordinates[1]);
        } else {
            return undefined;
        }
    }

    getEndPosDependance() {
        if (this.objectDoc.geometry) {
            let coordinates = this.positionService.getLatLongFromWKT(this.objectDoc.geometry, true);
            return this.roundGPSCoordinate(coordinates[0]) + ", " + this.roundGPSCoordinate(coordinates[1]);
        } else {
            return undefined;
        }
    }

    getEndPointSR() {
        return this.objectDoc.systemeRepId || null;
    }

    locateMe() {
        this.geolocationService.getCurrentLocation()
            .then(
                (position) => {
                    if (this.isDependance()) {
                        this.handlePosDependance(position);
                    } else {
                        this.handlePos(position);
                    }
                },
                (error) => {
                    console.error(error);
                    this.geolocationService.openModal('Erreur lors de la localisation GPS', error.message).then();
                }
            );
    }

    locateMeEnd() {
        this.geolocationService.getCurrentLocation()
            .then(
                (position) => {
                    this.handlePosDependanceEnd(position);
                },
                (error) => {
                    console.error(error);
                    this.geolocationService.openModal('Erreur lors de la localisation GPS', error.message).then();
                }
            );
    }

    activatedGPSPositionButton() {
        return this.objectDoc;
    }

    activatedPositionButton() {
        return this.objectDoc && (this.objectDoc.linearId || this.isDependance());
    }

    handleDrawPolygon(geometry) {
        this.objectDoc.geometry = geometry;
    }

    compareRef(obj1, obj2) {
        let a = null;
        let b = null;
        let comparison = 0;
        if (this.showText('fullName')) {
            a = obj1.libelle;
            b = obj2.libelle;
        } else {
            a = obj1.abrege ? obj1.abrege : obj1.designation;
            b = obj2.abrege ? obj2.abrege : obj2.designation;
        }

        if (a > b) {
            comparison = 1;
        } else if (a < b) {
            comparison = -1;
        }

        return comparison;
    }

    title(eosReference) {
        if (this.showText('fullName')) {
            return eosReference.libelle ? eosReference.libelle : 'libellé indéterminé / id:  ' + eosReference.id;
        } else if (this.showText('abstract')) {
            return eosReference.abrege ? eosReference.abrege : eosReference.designation + ' : ' + eosReference.libelle
        } else if (this.showText('both')) {
            return eosReference.abrege ? eosReference.abrege + ' : ' + eosReference.libelle : eosReference.designation + ' : ' + eosReference.libelle
        } else {
            //default
            return eosReference.abrege ? eosReference.abrege + ' : ' + eosReference.libelle : eosReference.designation + ' : ' + eosReference.libelle
        }
    }

    calculateApproximatePosition(borneId: string, borne_aval: string, borne_distance: number, systemeReperageBornes: Array<any>, tronconGeometry: string) {
        const index = systemeReperageBornes.findIndex((item) => {
            return item.borneId === borneId;
        });

        const srb = systemeReperageBornes[index];

        // Calculate approximate position
        const x = (this.wktFormat.readGeometry(srb.borneGeometry) as Point).getCoordinates();
        let y;

        if (borne_aval === 'true') {
            y = (index === 0)
                ? (this.wktFormat.readGeometry(systemeReperageBornes[index].borneGeometry) as Point).getCoordinates()
                : (this.wktFormat.readGeometry(systemeReperageBornes[index - 1].borneGeometry) as Point).getCoordinates();
        } else {
            y = (index === systemeReperageBornes.length - 1)
                ? (this.wktFormat.readGeometry(systemeReperageBornes[index].borneGeometry) as Point).getCoordinates()
                : (this.wktFormat.readGeometry(systemeReperageBornes[index + 1].borneGeometry) as Point).getCoordinates();
        }

        const v = glMatrix.vec2.sub([], y, x);

        const vn = glMatrix.vec2.normalize(v, v);

        const vs = glMatrix.vec2.scale(vn, vn, borne_distance);

        const o = glMatrix.vec2.add([], x, vs);

        // Try to find the closest point in Tronçon
        const o1 = this.wktFormat.readGeometry(tronconGeometry).getClosestPoint(o);

        return 'POINT(' + o1[0] + ' ' + o1[1] + ')';
    }

    private initIsLinear() {
        if (this.isParcelleVegetation()) {
            this.isLinear = true;
            return;
        }

        if (this.isNew) {
            this.isLinear = false;
        } else {
            if (this.objectDoc.positionDebut && this.objectDoc.positionFin && this.objectDoc.positionDebut === this.objectDoc.positionFin) {
                this.isLinear = false;
            } else if (this.objectDoc.borneDebutId && this.objectDoc.borneFinId
                && (this.objectDoc.borneDebutId === this.objectDoc.borneFinId
                    || this.objectDoc.borne_debut_aval === this.objectDoc.borne_fin_aval
                    || this.objectDoc.borne_debut_distance === this.objectDoc.borne_fin_distance)) {
                this.isLinear = false;
            } else {
                this.isLinear = true;
            }
        }
    }

    // 7 decimal places according GPS location accuracy
    private roundGPSCoordinate(x) {
        return Number.parseFloat(x).toFixed(7);
    }

    // ??
    public isAhObjectType() {
        return this.objectType === 'DesordreDependance'
            || this.objectType === 'PrestationAmenagementHydraulique'
            || this.objectType === 'StructureAmenagementHydraulique'
            || this.objectType === 'OuvrageAssocieAmenagementHydraulique'
            || this.objectType === 'OrganeProtectionCollective'
            || this.objectType === 'TraitAmenagementHydraulique';
    }

    // ??
    public itChange(a) {
        this.objectDoc.amenagementHydrauliqueId = a.id;
    }

    // ??
    public ahSelected(a) {
        return this.objectDoc.amenagementHydrauliqueId === a.id;
    }
}
