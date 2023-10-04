import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CameraService } from '@ionic-lib/lib-camera/camera.service';
import { DirectoryEntry, Entry, File, Metadata } from '@ionic-native/file/ngx';
import { Options } from '@ionic-lib/lib-camera/interface.model';
import { Camera } from '@ionic-native/camera/ngx';
import { UuidUtils } from '../../../utils/uuid-utils';
import { ModalController, ToastController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GeolocationService } from '../../../services/geolocation.service';
import { AlertController } from '@ionic/angular';
import { PositionbyborneModalPhotoComponent } from './positionbyborne-modal-photo/positionbyborne-modal-photo.component';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { PositionService } from '../../../services/position.service';
import { SirsDataService } from '../../../services/sirs-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { transform } from 'ol/proj';
import { LocalDatabase } from 'src/app/services/local-database.service';
import { EditionModeService } from 'src/app/services/edition-mode.service';
import {DatabaseModel} from "../../database-connection/models/database.model";
import {DatabaseService} from "../../../services/database.service";
import { PermissionsService } from "../../../services/permissions.service";

@Component({
    selector: 'app-photo-edit',
    templateUrl: './photo-edit.component.html',
    styleUrls: ['./photo-edit.component.scss'],
})
export class PhotoEditComponent implements OnInit {
    private parentId: string;
    private photoId: string;
    private importPhotoData;
    private view = 'photo-form';
    private photoDoc;
    private mediaPath;
    private dataProjection;
    private isNew: boolean;
    private contactList;
    private coteList;
    private orientationList;
    private photoIndex;
    private objectDoc;
    public defaultObservateurId;

    constructor(private activeRoute: ActivatedRoute,
        private authService: AuthService,
        private cameraService: CameraService,
        private camera: Camera,
        private file: File,
        private webview: WebView,
        private toastCtrl: ToastController,
        private route: Router,
        private sirsDataService: SirsDataService,
        private cdr: ChangeDetectorRef,
        private httpClient: HttpClient,
        private geolocation: GeolocationService,
        private alertController: AlertController,
        private modalController: ModalController,
        private positionService: PositionService,
        private localDB: LocalDatabase,
        private editionModeService: EditionModeService,
                private databaseService: DatabaseService,
                private permissionsService: PermissionsService) {
    }

    ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.defaultObservateurId = config.context.defaultObservateurId;

                this.isNew = true;
                this.photoDoc = {
                    id: '',
                    chemin: '',
                    designation: '',
                    libelle: '',
                    orientationPhoto: '',
                    coteId: '',
                    commentaire: '',
                    photographeId: this.defaultObservateurId || '',
                    author: this.authService.getValue()._id,
                    valid: false
                };
                this.photoDoc['@class'] = 'fr.sirs.core.model.Photo';
                this.dataProjection = this.sirsDataService.sirsDoc.epsgCode;
                this.mediaPath = `${this.file.dataDirectory}medias`;
                this.parentId = this.activeRoute.snapshot.paramMap.get('parentId');
                this.photoId = this.activeRoute.snapshot.paramMap.get('photoId'); //Mandatory if edition

                if (this.parentId && this.parentId !== '') {
                    this.initReferenceList();
                    this.localDB.get(this.parentId)
                        .then(doc => {
                            this.objectDoc = doc;
                            this.objectDoc.valid = false;
                            if (!this.objectDoc.photos) this.objectDoc.photos = [];

                            //If edition
                            if (this.photoId && this.photoId !== '') {
                                this.isNew = false;
                                const photos = this.objectDoc.photos;
                                if (photos) {
                                    this.photoIndex = photos.findIndex(p => p.id === this.photoId)
                                    if (this.photoIndex === -1) {
                                        throw new Error('Unexpected behaviour: parent document ' + this.parentId + ' should contain photo ' + this.photoId);
                                    } else {
                                        this.photoDoc = photos[this.photoIndex];
                                        this.photoDoc.valid = false;
                                    }
                                } else {
                                    throw new Error('Unexpected behaviour: Ask for edition of photo ' + this.photoId + ', but no photos found in the parent document ' + this.parentId);
                                }
                            }
                        })
                } else {
                    throw new Error("Can't use this component without parent reference parameter: parentId");
                }
            });
    }

    private initReferenceList() {
        this.sirsDataService.getContactList().then((list) => {
            this.contactList = list;
        });
        this.sirsDataService.getRefOrientationPhoto().then((list) => {
            this.orientationList = list;
        });
        this.sirsDataService.getRefCote().then((list) => {
            this.coteList = list;
        });
    }

    private back() {
        this.route.navigateByUrl('/main');
    }

    private async save() {
        if (this.photoDoc.id) {
            const currentDateTime = formatDate(Date.now(), 'yyyy-MM-dd', 'en-US');

            //Update parent photos
            this.photoDoc.date = currentDateTime;
            if (this.isNew) {
                this.objectDoc.photos.push(this.photoDoc);
            } else {
                if (this.photoIndex === -1) throw new Error('Unexpected behaviour: parent document ' + this.parentId + ' should contain photo ' + this.photoId);
                this.objectDoc.photos[this.photoIndex] = this.photoDoc;
            }

            //Update parent attachments
            const attachement = await this.createAttachementFromCurrentMedia();
            if (attachement) {
                if (!this.objectDoc._attachments) this.objectDoc._attachments = {};
                this.objectDoc._attachments[this.photoDoc.id] = attachement;
            }

            // Save parent
            this.objectDoc.dateMaj = currentDateTime;
            this.editionModeService.updateObject(this.objectDoc).then(() => {
                this.route.navigateByUrl('/main');
            });
        } else {
            this.toastCtrl.create({
                message: 'Formulaire d\'ajout de photo incomplet: Veuillez ajouter une photo',
                duration: 7000
            }).then(toast => toast.present());
        }
    }

    private convertImageUrl2Blob(url: string) {
        return new Promise((resolve, reject) => {
            // Convert url image to blob
            this.httpClient.get(url, { responseType: 'blob' })
                .subscribe(
                    (blob) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        // Convert blob to base64
                        reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                                const base64data = reader.result.replace('data:image/jpeg;base64,', '');
                                resolve(base64data);
                            } else {
                                reject();
                            }
                        };
                    },
                    (error) => {
                        reject(error);
                    }
                );
        })
    }

    private async selectPositionBySR() {
        let data;

        if (this.photoDoc.systemeRepId) {
            data = {
                systemeRepId: this.photoDoc.systemeRepId,
                borne_aval: this.photoDoc.borne_debut_aval ? 'true' : 'false',
                borne_distance: this.photoDoc.borne_debut_distance,
                borneId: this.photoDoc.borneDebutId,
                borneLibelle: this.photoDoc.borneDebutLibelle || '',
                media: true,
                parentSystemeRepId: this.objectDoc.systemeRepDefautId
            };
        } else {
            data = {
                systemeRepId: '',
                borne_aval: '',
                borne_distance: 0,
                borneId: '',
                borneLibelle: '',
                media: true,
                parentSystemeRepId: this.objectDoc.systemeRepDefautId
            };
        }
        const modal = await this.modalController.create({
            component: PositionbyborneModalPhotoComponent,
            animated: true,
            cssClass: 'modal-css',
            componentProps: { data }
        });
        modal.onDidDismiss()
            .then(
                (result) => {
                    if (result.data) {
                        this.handlePositionByBorne(result.data);
                    }
                }
            );
        return await modal.present();
    }

    private getPhotoPath(photo) {
        if (photo.chemin) {
            let path = `${photo.id}${photo.chemin.substring(photo.chemin.indexOf('.')).toLowerCase()}`;
            path = `${this.mediaPath}/${path}`;
            return this.webview.convertFileSrc(path);
        } else {
            return null;
        }
    }

    private locateMe() {
        if (this.geolocation.isEnabled) {
            this.geolocation.getCurrentLocation()
                .then(
                    (position) => {
                        this.handlePos(position);
                    },
                    (error) =>{
                        console.error(error);
                        this.geolocation.openModal('Erreur lors de la localisation GPS', error.message).then();
                    }
                );
        }
    }

    private async selectPosition() {
        const alert = await this.alertController.create({
            header: 'Sélectionner une position sur la carte',
            message: `Voulez vous modifier le positionnement de l'objet ? \n Cette opération va écraser les anciennes valeurs`,
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Valider',
                    handler: () => {
                        this.setView('photo-map');
                    }
                }
            ]
        });
        await alert.present();
    }

    private drawNote() {
        this.view = 'photo-note';
    }

    private takePhoto() {
        this.permissionsService
            .handleCameraPermissions()
            .then(() => {
                this.cameraService.takePhoto({
                    destinationType: this.camera.DestinationType.FILE_URI
                })
                    .then(
                        (value: string) => {
                            const valueTmp = value.replace('data:image/jpeg;base64,', '');
                            this.file.resolveLocalFilesystemUrl(valueTmp)
                                .then(
                                    (file: Entry) => {
                                        this.savePicture(file);
                                    }
                                );
                        },
                        (error) => {
                            console.error(error);
                        }
                    );
            }, console.error);
    }

    private savePicture(file: Entry) {
        file.getMetadata((metadata: Metadata) => {
            if (metadata.size > 1048576) {
                this.toastCtrl.create({
                    message: 'Veuillez choisir une photo de taille inférieur à 1.2Mo',
                    duration: 3000
                }).then(toast => toast.present());
                file.remove(() => console.debug('File has been removed correctly'));
                return;
            } else {
                this.file.resolveDirectoryUrl(this.mediaPath)
                    .then(
                        (targetDir: DirectoryEntry) => {
                            // Copy image file in its final directory.
                            const photoId = this.isNew ? UuidUtils.generateUuid() : this.photoDoc.id;
                            const fileName = photoId + '.jpg';
                            // Copy image file in its final directory.
                            file.copyTo(targetDir, fileName, () => {
                                // Store the photo in the object document.
                                this.fillPhotoDoc(photoId, fileName);
                                const forceReloadImage = '?' + (new Date()).getTime(); //force angular to detect new change on importPhotoData and then reload the source of the image
                                this.importPhotoData = this.getPhotoPath(this.photoDoc) + forceReloadImage;
                                this.cdr.detectChanges();
                            });
                        },
                        (error) => {
                            console.error(error);
                        }
                    );
            }
        });
    }

    private setView(view) {
        this.view = view;
    }

    private getPhotoFromGallery() {
        this.cameraService.getPhotoFromGallery()
            .then(
                (imageData: string) => {
                    if (this.cameraService.calculateImageSize(imageData) > 1048576) {
                        this.toastCtrl.create({
                            message: 'Veuillez choisir une photo de taille inférieur à 1.2Mo',
                            duration: 3000
                        }).then(toast => toast.present());
                        return;
                    }

                    const photoId = this.isNew ? UuidUtils.generateUuid() : this.photoDoc.id;
                    const fileName = photoId + '.jpg';
                    // Store the photo in the object document.
                    this.fillPhotoDoc(photoId, fileName);
                    this.importPhotoData = imageData;
                    this.cdr.detectChanges();
                },
                (error) => {
                    console.error(error);
                }
            );
    }

    private fillPhotoDoc(photoId: string, fileName: string) {
        this.photoDoc.id = photoId;
        this.photoDoc.chemin = '/' + fileName;
    }

    private getPosition() {
        return this.photoDoc.positionDebut ? this.positionService.getLatLongFromWKT(this.photoDoc.positionDebut) : 'à définir';
    }

    private handlePos(pos) {
        delete this.photoDoc.systemeRepId;
        delete this.photoDoc.borne_debut_aval;
        delete this.photoDoc.borne_debut_distance;
        delete this.photoDoc.borneDebutId;
        delete this.photoDoc.borne_fin_aval;
        delete this.photoDoc.borne_fin_distance;
        delete this.photoDoc.borneFinId;
        delete this.photoDoc.borneDebutLibelle;
        delete this.photoDoc.borneFinLibelle;
        delete this.photoDoc.approximatePositionDebut;
        delete this.photoDoc.approximatePositionFin;

        this.photoDoc.editedGeoCoordinate = true;
        const coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);
        const geom = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
        this.photoDoc.positionDebut = geom;
        this.photoDoc.positionFin = geom;
        this.photoDoc.geometry = 'LINESTRING (' + coordinate[0] + ' ' + coordinate[1] + ', ' + coordinate[0] + ' ' + coordinate[1] + ')';
    }

    private handlePositionByBorne(data) {
        delete this.photoDoc.positionDebut;
        delete this.photoDoc.positionFin;
        delete this.photoDoc.geometry;
        delete this.photoDoc.longitudeMin;
        delete this.photoDoc.longitudeMax;
        delete this.photoDoc.latitudeMin;
        delete this.photoDoc.latitudeMax;
        delete this.photoDoc.geometryMode;

        this.photoDoc.editedGeoCoordinate = false;
        this.photoDoc.systemeRepId = data.systemeRepId;
        //borne debut
        this.photoDoc.borne_debut_aval = data.borne_aval === 'true';
        this.photoDoc.borne_debut_distance = data.borne_distance;
        this.photoDoc.borneDebutId = data.borneId;
        this.photoDoc.approximatePositionDebut = data.approximatePosition;
        this.photoDoc.borneDebutLibelle = data.borneLibelle;
        //borne fin
        this.photoDoc.borne_fin_aval = data.borne_aval === 'true';
        this.photoDoc.borne_fin_distance = data.borne_distance;
        this.photoDoc.borneFinId = data.borneId;
        this.photoDoc.approximatePositionFin = data.approximatePosition;
        this.photoDoc.borneFinLibelle = data.borneLibelle;
    }

    private getImage() {
        return this.importPhotoData ? this.importPhotoData : this.getPhotoPath(this.photoDoc)
    }

    private async createAttachementFromCurrentMedia() {
        try {
            const base64data = await this.convertImageUrl2Blob(this.getImage());
            return { content_type: 'image/jpeg', data: base64data };
        } catch (error) {
            return null;
        }
    }
}
