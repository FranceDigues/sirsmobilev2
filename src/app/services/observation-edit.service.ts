// @ts-nocheck

import { HttpClient } from '@angular/common/http';
import { ApplicationRef, Injectable } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ToastNotification } from '../shared/models/toast-notification.model';
import { ObjectDetails } from './object-details.service';
import { LocalDatabase } from './local-database.service';
import { File, DirectoryEntry, FileEntry } from '@ionic-native/file/ngx';
import { formatDate } from '@angular/common';
import { UuidUtils } from '../utils/uuid-utils';
import { AuthService } from './auth.service';
import { transform } from 'ol/proj';
import {
    StorageService
} from '../../../libs/geomatys-ionic-libraries-framework/demo/src/lib/lib-storage/storage.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DatabaseService } from './database.service';
import WKT from 'ol/format/WKT';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { SirsDataService } from './sirs-data.service';
import { PluginUtils } from '../utils/plugin-utils';
import { ToastService } from './toast.service';
import Point from "ol/geom/Point";

@Injectable({
    providedIn: 'root'
})
export class ObservationEditService {

    doc;
    objectDoc;
    objectType;
    objectId: string;
    obsId: string;
    isNewObject: boolean;
    mediaPath: string;
    showContent: boolean;
    photos: Array<any>;
    loaded = {};
    troncons = [];
    mediaOptions;
    importPhotoData;
    dataProjection;
    refOrientationPhoto;
    cotes;
    contact;
    contactList;
    urgenceList;
    urgence;
    suiteApporterList;
    suiteApporter;
    private _positionPrecision: number;

    // SEPCIFICATION RESEAU ET OUVRAGE
    etatOuvrage;
    etatAccessoire;
    etatGenieCivil;
    etatOuvAccGCList;
    manoeuvreOuvrage;
    manoeuvreOuvrageList;

    constructor(private objectDetails: ObjectDetails,
        private localDB: LocalDatabase, private file: File, private http: HttpClient,
        private fileOpener: FileOpener, private authService: AuthService,
        private sirsDataService: SirsDataService, private storageService: StorageService,
        private webview: WebView, private db: DatabaseService, private toastCtrl: ToastController,
        private ref: ApplicationRef, private toastService: ToastService) {
    }

    // pre init method exists as the init methods are called from other components and services.
    async preInit(sirsDataService: SirsDataService) {
        this.dataProjection = sirsDataService.sirsDoc.epsgCode;
        this.mediaPath = `${this.file.dataDirectory}medias`;
        this.showContent = true;
        this.loaded = {};
        this.mediaOptions = {
            id: '',
            chemin: '',
            designation: '',
            positionDebut: '',
            orientationPhoto: '',
            coteId: '',
            commentaire: '',
            photographeId: '',
            author: this.authService.user._id // Kinda hacked to get directly user value rather than using getValue() method. Otherwise getValue() returns null. Might be an async problem.
        };
        this.importPhotoData = null;
    }

    init(objectId: string, obsId: string) {
        this.setValuesToDefault();

        this.storageService.getItem('AppTronconsFavorities')
            .then(
                (troncons) => {
                    if (Array.isArray(troncons)) {
                        this.troncons = troncons;
                    } else {
                        this.troncons = [];
                    }
                }
            );
        this.objectDoc = this.objectDetails.selectedObject;
        this.objectType = PluginUtils.doc2Class(this.objectDoc);

        this.objectId = objectId;
        this.obsId = obsId;
        this.isNewObject = !this.obsId;

        this.doc = this.isNewObject ? this.createNewObservation() : Object.assign({}, this.getTargetObservation());
        this.photos = this.doc.photos;
        this.contact = this.doc.observateurId;

        if (this.doc.urgenceId) {
            this.urgence = parseInt(this.doc.urgenceId.substring(this.doc.urgenceId.lastIndexOf(':') + 1), 10);
        }
        if (this.doc.suiteApporterId) {
            this.suiteApporter = this.doc.suiteApporterId;
        }
        if (this.doc.etatOuvrageId) {
            this.etatOuvrage = this.doc.etatOuvrageId;
        }
        if (this.doc.etatAccessoireId) {
            this.etatAccessoire = this.doc.etatAccessoireId;
        }
        if (this.doc.etatGenieCivilId) {
            this.etatGenieCivil = this.doc.etatGenieCivilId;
        }
        if (this.doc.manoeuvreOuvrageId) {
            this.manoeuvreOuvrage = this.doc.manoeuvreOuvrageId;
        }
    }

    setValuesToDefault() {
        this.dataProjection = this.sirsDataService.sirsDoc.epsgCode;
        this.mediaPath = `${this.file.dataDirectory}medias`;
        this.mediaOptions = {
            id: '',
            chemin: '',
            designation: '',
            positionDebut: '',
            orientationPhoto: '',
            coteId: '',
            commentaire: '',
            photographeId: '',
            author: this.authService.getValue()._id
        };
        this.importPhotoData = null;
        this.showContent = true;
        this.loaded = {};
    }

    createNewObservation() {
        const newObj = {
            id: UuidUtils.generateUuid(),
            date: formatDate(Date.now(), 'yyyy-MM-dd', 'en-US'),
            photos: [],
            valid: false
        };

        switch (this.objectType) {
            case 'StationPompage':
            case 'ReseauHydrauliqueFerme':
            case 'OuvrageHydrauliqueAssocie':
            case 'ReseauHydrauliqueCielOuvert':
            case 'VoieAcces':
            case 'OuvrageFranchissement':
            case 'OuvertureBatardable':
            case 'VoieDigue':
            case 'OuvrageVoirie':
            case 'ReseauTelecomEnergie':
            case 'OuvrageTelecomEnergie':
            case 'OuvrageParticulier':
            case 'EchelleLimnimetrique':
            case 'Prestation':
                newObj['@class'] = 'fr.sirs.core.model.Observation' + this.objectType;
                return newObj;
            case 'DesordreDependance':
            case 'AmenagementHydraulique':
            case 'PrestationAmenagementHydraulique':
            case 'OrganeProtectionCollective':
            case 'StructureAmenagementHydraulique':
            case 'OuvrageAssocieAmenagementHydraulique':
                newObj['@class'] = 'fr.sirs.core.model.ObservationDependance';
                return newObj;
            default :
                newObj['@class'] = 'fr.sirs.core.model.Observation';
                newObj['urgenceId'] = 'RefUrgence:1';
                newObj['nombreDesordres'] = 0;
                return newObj;
        }
    }

    getTargetObservation() {
        let i = this.objectDoc.observations.length;
        while (i--) {
            if (this.objectDoc.observations[i].id === this.obsId) {
                return this.objectDoc.observations[i];
            }
        }
        throw new Error('No observation "' + this.obsId + '" found in disorder document.');
    }

    getApproximatePosition(borneId, borneAval, borneDistance, flag) {
        const wktFormat = new WKT();
        return new Promise((resolve) => {
            const troncon = this.troncons.find((item) => {
                return item.id === this.objectDoc.linearId;
            });

            this.db.getLocalDB().query('byId', {
                key: troncon.systemeRepDefautId
            }).then((results) => {
                const systemeReperage = results.rows.filter((item) => {
                    return item.id === this.objectDoc.systemeRepId;
                })[0];

                this.db.getLocalDB().query('getBornesIdsHB', {
                    keys: systemeReperage.value.systemeReperageBornes
                        .map((item) => {
                            return item.borneId;
                        })
                }).then((res) => {
                    systemeReperage.value.systemeReperageBornes.forEach((item1) => {
                        res.rows.forEach((item2) => {
                            if (item1.borneId === item2.id) {
                                item1.libelle = item2.value.libelle;
                                item1.borneGeometry = item2.value.geometry;
                            }
                        });
                    });

                    const index = systemeReperage.value.systemeReperageBornes.findIndex((item) => {
                        return item.borneId === borneId;
                    });

                    const srb = systemeReperage.value.systemeReperageBornes[index];

                    // Calculate approximate position
                    const x = (wktFormat.readGeometry(srb.borneGeometry) as Point).getCoordinates();
                    let y;

                    if (borneAval) {
                        y = (index === systemeReperage.value.systemeReperageBornes.length - 1)
                            ? (wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index].borneGeometry) as Point).getCoordinates()
                            : (wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index + 1].borneGeometry) as Point).getCoordinates();
                    } else {
                        y = (index === 0)
                            ? (wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index].borneGeometry) as Point).getCoordinates()
                            : (wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index - 1].borneGeometry) as Point).getCoordinates();
                    }

                    const v = glMatrix.vec2.sub([], y, x);

                    const vn = glMatrix.vec2.normalize(v, v);

                    const vs = glMatrix.vec2.scale(vn, vn, borneDistance);

                    const o = glMatrix.vec2.add([], x, vs);

                    this.objectDoc[flag] = 'POINT(' + o[0] + ' ' + o[1] + ')';
                    resolve(this.objectDoc);

                });

            });
        });

    }

    getPhotoPath(photo, details?) {
        let path = (details) ? `${photo.id}.jpg` : `${photo.id}${photo.chemin.substring(photo.chemin.indexOf('.')).toLowerCase()}`;
        path = `${this.mediaPath}/${path}`;
        return this.webview.convertFileSrc(path);
    }

    getImage(imageUrl: string): Observable<Blob> {
        return this.http.get(imageUrl, { responseType: 'blob' });
    }

    public static base64toBlob(base64Data: string, contentType: string): Blob {
        contentType = contentType || '';
        let sliceSize = 512;
        let byteCharacters = atob(base64Data);
        let byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }

    loadImage(photo, details?) {
        const imageUrl = this.getPhotoPath(photo, details);
        this.http.head(imageUrl, {headers: {'Accept': 'image/*'}, responseType: 'blob'}).subscribe(
            () => {
                this.loaded[photo.id] = true;
                this.ref.tick(); // Force Ionic to detect changes
            },
            async (_) => {
                console.debug('Object doesn\'t exists, loading from DB');
                if (this.objectDoc._attachments) {
                    let keyAttachment = null;
                    let objAttachment;
                    Object.keys(this.objectDoc._attachments).forEach((key) => {
                        if (key.indexOf(photo.id) !== -1) {
                            keyAttachment = key;
                        }
                    });
                    objAttachment = this.objectDoc._attachments[keyAttachment];
                    if (objAttachment) {
                        let blob;
                        try {
                            blob = await this.localDB.getAttachment(this.objectDoc._id, keyAttachment);
                        } catch (err) {
                            if (err && err.name && err.name === 'not_found') {
                                blob = ObservationEditService.base64toBlob(objAttachment.data, objAttachment.content_type);
                            } else {
                                this.toastService.show(new ToastNotification('Erreur lors de la sauvegarde du fichier dans la base de données', 3000));
                                console.error(err);
                            }
                        }
                        let fileName;
                        if (keyAttachment.indexOf('.') !== -1) {
                            fileName = keyAttachment;
                        } else {
                            let ext;
                            switch (objAttachment.content_type) {
                                case 'image/jpeg':
                                    ext = '.jpg';
                                    break;
                                case 'image/png':
                                    ext = '.png';
                                    break;
                                case 'image/gif':
                                    ext = '.gif';
                                    break;
                                case 'image/tiff':
                                    ext = '.tif';
                                    break;
                            }
                            fileName = keyAttachment + ext;
                        }
                        this.file.resolveDirectoryUrl(this.mediaPath)
                            .then((targetDir: DirectoryEntry) => {
                                targetDir.getFile(fileName, { create: true }, (file: FileEntry) => {
                                    file.createWriter((fileWriter) => {
                                        fileWriter.onwriteend = () => {
                                            this.loaded[photo.id] = true;
                                            this.ref.tick(); // Force Ionic to detect changes
                                        };
                                        fileWriter.write(blob);
                                    }, () => {
                                        console.warn('Error while creating DB filewriter');
                                        this.loaded[photo.id] = true;
                                        this.ref.tick(); // Force Ionic to detect changes
                                    });
                                });
                            });
                    } else {
                        console.warn('No attachment available');
                        this.loaded[photo.id] = true;
                        this.ref.tick(); // Force Ionic to detect changes
                    }
                } else {
                    console.warn(`missing image attachment, DB model not respected.`)
                    this.loaded[photo.id] = true;
                    this.ref.tick(); // Force Ionic to detect changes
                }
            });
    }

    // Index of looking for multiple occurrence of a character and returning a list with all the indexes.
    homemadeIndexOf(myString: string, character: string) {
        const list: number[] = [];
        for (let i = 0; i < myString.length; i++) {
            if (myString.charAt(i) === character) {
                list.push(i);
            }
        }
        return list;
    }

    open(photo) {
        const url = this.getPhotoPath(photo, true);
        const indexList = this.homemadeIndexOf(url, '/');
        const finalPath = url.substring(indexList[3]);
        this.fileOpener.open(finalPath, 'image/jpeg')
            .then(
                () => {
                    console.debug('File opened successfully');
                },
                (error) => {
                    console.error('Error open method :', error);
                }
            );
    }

    remove(photo): void {
        if (this.objectDoc._attachments && this.objectDoc._attachments[photo.id]) {
            delete this.objectDoc._attachments[photo.id];
        } else {
            console.warn(`The deleted picture doesn't exists in the local database`);
        }

        const index = this.photos.findIndex((item) => item.id === photo.id);
        if (index !== -1) {
            this.photos.splice(index, 1);
        }
    }

    warningSizeMessage() {
        this.toastCtrl.create({
            message: 'Veuillez choisir une photo de taille inférieur à 1.2 Mo',
            duration: 3000
        }).then(toast => toast.present());
    }

    /**
     * @param pos
     * @param accuracy accuracy in meters
     */
    public handlePos(pos: Coordinates, accuracy: number): void {
        const coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);
        this.mediaOptions.positionDebut = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
        this._positionPrecision = accuracy;
    }

    handlePosByBorne(data) {
        delete this.mediaOptions.positionDebut;
        this.mediaOptions.systemeRepId = data.systemeRepId;
        this.mediaOptions.borne_debut_aval = data.borne_aval === 'true';
        this.mediaOptions.borne_debut_distance = data.borne_distance;
        this.mediaOptions.borneDebutId = data.borneId;
        this.mediaOptions.borneDebutLibelle = data.borneLibelle;
    }

    isReseauEtOuvrageType() {
        return PluginUtils.isReseauOuvrageClass(this.objectType);
    }

    get positionPrecision(): number {
        return this._positionPrecision;
    }
}
