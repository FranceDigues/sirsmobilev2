import { HttpClient } from '@angular/common/http';
import { ApplicationRef, Injectable } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ObjectDetails } from './object-details.service';
import { LocalDatabase } from './local-database.service';
import { File, DirectoryEntry, FileEntry } from '@ionic-native/file/ngx';
import { formatDate } from '@angular/common';
import { UuidUtils } from '../utils/uuid-utils';
import { AuthService } from './auth.service';
import { SirsDocService } from './sirsdoc.service';
import { transform } from 'ol/proj';
import { StorageService } from '../../../libs/geomatys-ionic-libraries-framework/demo/src/lib/lib-storage/storage.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DatabaseService } from './database.service';
import WKT from 'ol/format/WKT';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

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
    photos;
    loaded = {};
    troncons = [];
    mediaOptions;
    importPhotoData;
    dataProjection;
    orientations;
    cotes;
    contact;
    contactList;
    urgenceList;
    urgence;

    constructor(private objectDetails: ObjectDetails,
                private localDB: LocalDatabase, private file: File, private http: HttpClient,
                private fileOpener: FileOpener, private authService: AuthService,
                private sirsDoc: SirsDocService, private storageService: StorageService,
                private webview: WebView, private db: DatabaseService, private toastCtrl: ToastController,
                private ref: ApplicationRef) {
        this.dataProjection = this.sirsDoc.get().epsgCode;
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
            author: this.authService.getValue()._id
        };
        this.importPhotoData = null;
    }

    init(objectId: string, obsId: string) {
        this.setValuesToDefault();

        this.orientations = this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.RefOrientationPhoto'],
            endkey: ['fr.sirs.core.model.RefOrientationPhoto', {}]
        });

        this.cotes = this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.RefCote'],
            endkey: ['fr.sirs.core.model.RefCote', {}]
        });

        this.contactList = this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.Contact'],
            endkey: ['fr.sirs.core.model.Contact', {}],
            include_docs: true
        });

        this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.RefUrgence'],
            endkey: ['fr.sirs.core.model.RefUrgence', {}]
        }).then(
            (urgenceList) => {
                this.urgenceList = urgenceList.map(item => {
                    item.value.id = parseInt(item.value.id.substring(item.value.id.lastIndexOf(':') + 1), 10);
                    return item.value;
                });
            }
        );

        this.storageService.getItem('AppTronconsFavorities')
            .then(
                (troncons) => {
                    if (Array.isArray(troncons)) {
                        this.troncons = troncons;
                    } else {
                        this.troncons = [];
                    }
                }
            )
        this.objectDoc = this.objectDetails.selectedObject;
        const lastIndexOfClass = this.objectDoc['@class'].lastIndexOf('.');
        this.objectType = this.objectDoc['@class']
            .substring(lastIndexOfClass + 1);

        this.objectId = objectId;
        this.obsId = obsId;
        this.isNewObject = !this.obsId;

        this.doc = this.isNewObject ? this.createNewObservation() : Object.assign({}, this.getTargetObservation());
        this.photos = this.doc.photos;
        this.contact = this.doc.observateurId;

        if (this.doc.urgenceId) {
            this.urgence = parseInt(this.doc.urgenceId.substring(this.doc.urgenceId.lastIndexOf(':') + 1), 10);
        }
    }

    setValuesToDefault() {
        this.dataProjection = this.sirsDoc.get().epsgCode;
        this.mediaOptions = {
            id: '',
            chemin: '',
            designation: '',
            positionDebut: '',
            orientationPhoto: '',
            coteId: '',
            commentaire: '',
            author: this.authService.getValue()._id
        };
        this.importPhotoData = null;
        this.showContent = true;
        this.loaded = {};
    }

    createNewObservation() {
        let newObj = {
            'id': UuidUtils.generateUuid(),
            'date': formatDate(Date.now(), 'yyyy-MM-dd', 'en-US'),
            'photos': [],
            'valid': false
        };

        switch (this.objectType) {
            case 'StationPompage':
            case 'ReseauHydrauliqueFerme':
            case  'OuvrageHydrauliqueAssocie':
            case  'ReseauHydrauliqueCielOuvert':
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
                newObj['@class'] = 'fr.sirs.core.model.ObservationDependance';
                return newObj;
            default :
                newObj['@class'] = 'fr.sirs.core.model.Observation';
                newObj['urgenceId'] = 'RefUrgence:1';
                newObj['nombreDesordres'] = 0;
                return newObj;
        }
        ;
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
        let wktFormat = new WKT();
        return new Promise((resolve) => {
            let troncon = this.troncons.find((item) => {
                return item.id === this.objectDoc.linearId;
            });

            this.db.getLocalDB().query('byId', {
                key: troncon.systemeRepDefautId
            }).then((results) => {
                let systemeReperage = results.rows.filter((item) => {
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

                    let index = systemeReperage.value.systemeReperageBornes.findIndex((item) => {
                        return item.borneId === borneId;
                    });

                    let srb = systemeReperage.value.systemeReperageBornes[index];

                    // Calculate approximate position
                    let x = wktFormat.readGeometry(srb.borneGeometry).getCoordinates();
                    let y;

                    if (borneAval) {
                        y = (index === systemeReperage.value.systemeReperageBornes.length - 1)
                            ? wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index].borneGeometry).getCoordinates()
                            : wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index + 1].borneGeometry).getCoordinates();
                    } else {
                        y = (index === 0)
                            ? wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index].borneGeometry).getCoordinates()
                            : wktFormat.readGeometry(systemeReperage.value.systemeReperageBornes[index - 1].borneGeometry).getCoordinates();
                    }

                    let v = glMatrix.vec2.sub([], y, x);

                    let vn = glMatrix.vec2.normalize(v, v);

                    let vs = glMatrix.vec2.scale(vn, vn, borneDistance);

                    let o = glMatrix.vec2.add([], x, vs);

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
        return this.http.get(imageUrl, {responseType: 'blob'});
    }

    loadImage(photo, details?) {
        let image_url = this.getPhotoPath(photo, details);
        this.http.head(image_url, {}).subscribe(
            () => {
                this.loaded[photo.id] = true;
                this.ref.tick(); // Force Ionic to detect changes
            },
            (error) => {
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
                        this.localDB.getAttachment(this.objectDoc._id, keyAttachment)
                            .then((blob) => {
                                    let blobImage = blob;
                                    let fileName;
                                    if (keyAttachment.indexOf('.') != -1) {
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
                                            targetDir.getFile(fileName, {create: true}, (file: FileEntry) => {
                                                file.createWriter((fileWriter) => {
                                                    fileWriter.write(blobImage);
                                                    setTimeout(() => {
                                                        this.loaded[photo.id] = true;
                                                        this.ref.tick(); // Force Ionic to detect changes
                                                    }, 100); // Add Delay to be sure the src image is working (writing file is finished)
                                                }, () => {
                                                    this.loaded[photo.id] = true;
                                                    this.ref.tick(); // Force Ionic to detect changes
                                                    console.log('cannot write the data to the file');
                                                });
                                            });
                                        });
                                },
                                (err) => {
                                    this.loaded[photo.id] = true;
                                    this.ref.tick(); // Force Ionic to detect changes
                                    console.error(err);
                                });
                    } else {
                        this.loaded[photo.id] = true;
                        this.ref.tick(); // Force Ionic to detect changes
                        console.log('no attachment exit to load image');
                    }
                } else {
                    this.loaded[photo.id] = true;
                    this.ref.tick(); // Force Ionic to detect changes
                }
            });
    }

    open(photo) {
        const url = this.getPhotoPath(photo, true);
        this.fileOpener.open(url, 'image/jpeg')
            .then(
                () => {
                    console.log('File opened successfully');
                },
                (error) => {
                    console.log('Error open method :', error);
                }
            );
    }

    warningSizeMessage() {
        this.toastCtrl.create({
            message: 'Veuillez choisir une photo de taille infèrieur à 1.2Mo',
            duration: 3000
        }).then(toast => toast.present());
    }

    handlePos(pos) {
        const coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);
        this.mediaOptions.positionDebut = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
    }

    handlePosByBorne(data) {
        delete this.mediaOptions.positionDebut;
        this.mediaOptions.systemeRepId = data.systemeRepId;
        this.mediaOptions.borne_debut_aval = data.borne_aval === 'true';
        this.mediaOptions.borne_debut_distance = data.borne_distance;
        this.mediaOptions.borneDebutId = data.borneId;
        this.mediaOptions.borneDebutLibelle = data.borneLibelle;
    };

}
