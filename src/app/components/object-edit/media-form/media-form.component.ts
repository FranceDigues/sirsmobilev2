import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { EditObjectService } from '../../../services/edit-object.service';
import { CameraService } from '@ionic-lib/lib-camera/camera.service';
import { DirectoryEntry, Entry, File, FileEntry, Metadata } from '@ionic-native/file/ngx';
import { Options } from '@ionic-lib/lib-camera/interface.model';
import { Camera } from '@ionic-native/camera/ngx';
import { UuidUtils } from '../../../utils/uuid-utils';
import { ModalController, ToastController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GeolocationService } from '../../../services/geolocation.service';
import { AlertController } from '@ionic/angular';
import { PositionByBorneModalComponent } from '../positionbyborne-modal/positionbyborne-modal.component';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { PositionService } from '../../../services/position.service';
import { Coordinates } from '@ionic-native/geolocation/ngx';
import { SirsDataService } from '../../../services/sirs-data.service';
import { error } from "protractor";
import { PermissionsService } from "../../../services/permissions.service";

@Component({
    selector: 'app-media-form',
    templateUrl: './media-form.component.html',
    styleUrls: ['./media-form.component.scss'],
})
export class MediaFormComponent implements OnInit {
    @Output() changeView = new EventEmitter<string>();
    public importPhotoData;
    public view = 'media-form';
    public mediaOptions;
    public mediaPath;
    public dataProjection;
    public orientationList;
    public coteList;

    constructor(private authService: AuthService,
                private cameraService: CameraService,
                private camera: Camera,
                private file: File,
                private webview: WebView,
                private toastCtrl: ToastController,
                public EOS: EditObjectService,
                private sirsDataService: SirsDataService,
                private cdr: ChangeDetectorRef,
                private httpClient: HttpClient,
                private geolocation: GeolocationService,
                public alertController: AlertController,
                public modalController: ModalController,
                private positionService: PositionService,
                private permissionsService: PermissionsService) {
    }

    ngOnInit() {
        this.orientationList = this.sirsDataService.refOrientationPhoto;
        this.coteList = this.sirsDataService.refCote;
        this.dataProjection = this.sirsDataService.sirsDoc.epsgCode;
        this.mediaOptions = {
            id: '',
            chemin: '',
            designation: '',
            orientationPhoto: '',
            coteId: '',
            commentaire: '',
            photographeId: '',
            author: this.authService.getValue()._id
        };
        this.mediaPath = `${this.file.dataDirectory}medias`;
    }

    back() {
        this.changeView.emit('form');
    }

    getPosition() {
        return this.mediaOptions.positionDebut ? this.positionService.getLatLongFromWKT(this.mediaOptions.positionDebut) : 'à définir';
    }

    save() {
        if (this.mediaOptions.id) {
            if (!this.EOS.objectDoc.photos) {
                this.EOS.objectDoc.photos = [];
            }
            if (!this.EOS.objectDoc._attachments) {
                this.EOS.objectDoc._attachments = {};
            }
            this.EOS.objectDoc.photos.push(this.mediaOptions);
            const url = this.importPhotoData ? this.importPhotoData : this.getPhotoPath(this.EOS.objectDoc.photos[this.EOS.objectDoc.photos.length - 1]);
            // Convert url image to blob
            this.httpClient.get(url, {responseType: 'blob'})
                .subscribe(
                    (blob) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        // Convert blob to base64
                        reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                                const base64data = reader.result.replace('data:image/jpeg;base64,', '');
                                // Save the photo like attachment to the object
                                this.EOS.objectDoc._attachments[this.mediaOptions.id] = {
                                    content_type: 'image/jpeg',
                                    data: base64data
                                };
                                this.changeView.emit('form');
                            }
                        };
                    },
                    (error) => {
                        console.error(error);
                    }
                );
        } else {
            this.toastCtrl.create({
                message: 'Formulaire d\'ajout de média incomplet: Veuillez ajouter une photo',
                duration: 7000
            }).then(toast => toast.present());
        }
    }

    async selectPositionByReferralSystem() {
        const data = this.mediaOptions.systemeRepId ? {
            systemeRepId: this.mediaOptions.systemeRepId,
            borne_aval: this.mediaOptions.borne_debut_aval ? 'true' : 'false',
            borne_distance: this.mediaOptions.borne_debut_distance,
            borneId: this.mediaOptions.borneDebutId,
            borneLibelle: this.mediaOptions.borneDebutLibelle || '',
            media: true
        } : {
            systemeRepId: '',
            borne_aval: '',
            borne_distance: 0,
            borneId: '',
            borneLibelle: '',
            media: true
        };

        const modal = await this.modalController.create({
            component: PositionByBorneModalComponent,
            animated: true,
            cssClass: 'modal-css',
            componentProps: {
                data
            }
        });
        return await modal.present();
    }

    getPhotoPath(photo, details?) {
        let path = (details) ? `${photo.id}.jpg` : `${photo.id}${photo.chemin.substring(photo.chemin.indexOf('.')).toLowerCase()}`;
        path = `${this.mediaPath}/${path}`;
        return this.webview.convertFileSrc(path);
    }

    locateMe() {
        this.geolocation.getCurrentLocation()
            .then(
                (coordinates: Coordinates) => {
                    this.mediaOptions.positionDebut = this.positionService.getWKTFromLatLong(coordinates);
                },
                (error) => {
                 console.error(error);
                 this.geolocation.openModal('Erreur lors de la localisation GPS', error.message).then();
                }
            );
    }

    public handlePos(coordinates: Coordinates): void {
        this.mediaOptions.positionDebut = this.positionService.getWKTFromLatLong(coordinates);
    }

    async selectPosition() {
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
                        this.setView('media-map');
                    }
                }
            ]
        });

        await alert.present();
    }

    drawNote() {
        this.view = 'media-note';
    }

    takePhoto() {
        this.mediaOptions.id = '';
        this.mediaOptions.chemin = '';
        this.permissionsService
            .handleCameraPermissions()
            .then(() => this.takePhotoFromCamera(), console.error);
    }

    private takePhotoFromCamera() {
        this.cameraService.takePhoto({
            destinationType: this.camera.DestinationType.FILE_URI
        })
            .then(
                (value: string) => {
                    if (value) {
                        const valueTmp = value.replace('data:image/jpeg;base64,', '');
                        this.file.resolveLocalFilesystemUrl(valueTmp)
                            .then(
                                (file: FileEntry) => {
                                    this.savePicture(file);
                                }
                            );
                    }
                }
            )
            .catch(err => console.error("Error while taking a photo: " + err));
    }

    savePicture(file: FileEntry) {
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
                            this.importPhotoData = null;
                            const photoId = UuidUtils.generateUuid();
                            const fileName = photoId + '.jpg';
                            // Copy image file in its final directory.
                            file.copyTo(targetDir, fileName, () => {
                                // Store the photo in the object document.
                                this.fillMediaOptions(photoId, fileName);
                                // Set Photo base64
                                file.file((f) => {
                                    this.cameraService.convertBlobToBase64(f)
                                        .then((res) => {
                                            this.importPhotoData = res;
                                            // Force Image to change
                                            this.cdr.detectChanges();
                                        });
                                });
                            });
                        },
                        (error) => {
                            console.error(error);
                        }
                    );
            }
        });
    }

    setView(view) {
        this.view = view;
    }

    saveNote(file) {
        this.savePicture(file);
    }

    getPicFromGallery() {
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

                    const photoId = UuidUtils.generateUuid();
                    const fileName = photoId + '.jpg';
                    // Store the photo in the object document.
                    this.fillMediaOptions(photoId, fileName);
                    this.importPhotoData = imageData;
                    this.cdr.detectChanges();
                },
                (error) => {
                    console.error(error);
                }
            );
    }

    fillMediaOptions(photoId: string, fileName: string) {
        // Store the photo in the object document.
        this.mediaOptions.id = photoId;
        this.mediaOptions['@class'] = 'fr.sirs.core.model' + (this.EOS.isDependance() ? '.PhotoDependance' : '.Photo');
        this.mediaOptions.date = formatDate(Date.now(), 'yyyy-MM-dd', 'en-US');
        this.mediaOptions.chemin = '/' + fileName;
        this.mediaOptions.valid = false;
    }

    formatOptionText(orientation) {
        switch (this.EOS.showTextConfig) {
            case 'fullName':
                return orientation.value.libelle;
            case 'abstract':
                return orientation.value.abrege ? orientation.value.abrege
                    : (orientation.value.designation + ' : ' + orientation.value.libelle);
            default:
                return orientation.value.abrege
                    ? (orientation.value.abrege + ' : ' + orientation.value.libelle)
                    : (orientation.value.designation + ' : ' + orientation.value.libelle);
        }

    }
}
