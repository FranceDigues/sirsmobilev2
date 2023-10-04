import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ObservationEditService} from 'src/app/services/observation-edit.service';
import {ModalController, ToastController} from '@ionic/angular';
import { ToastService } from '../../../../services/toast.service';
import { ToastNotification } from '../../../../shared/models/toast-notification.model';
import {PositionByBorneModal2Component} from './positionbyborne-modal2/positionbyborne-modal2.component';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {CameraService} from '@ionic-lib/lib-camera/camera.service';
import {Camera} from '@ionic-native/camera/ngx';
import { File, Metadata, DirectoryEntry, FileEntry } from '@ionic-native/file/ngx';
import {UuidUtils} from 'src/app/utils/uuid-utils';
import {formatDate} from '@angular/common';
import {DatabaseService} from '../../../../services/database.service';
import {DatabaseModel} from '../../../database-connection/models/database.model';
import {SirsDataService} from "../../../../services/sirs-data.service";
import { PluginUtils } from "../../../../utils/plugin-utils";
import { PermissionsService } from "../../../../services/permissions.service";

@Component({
    selector: 'observation-media',
    templateUrl: './observation-media.component.html',
    styleUrls: ['./observation-media.component.scss'],
})
export class ObservationMediaComponent implements OnInit {

    @Output() readonly viewChange = new EventEmitter<string>();

    view: 'media' | 'map' | 'note';
    showTextConfig: string;
    pendingContactList: boolean;

    // Some elements of ObservationEditService are Promises, so we have to wait until they are ready.
    contactList;
    refOrientationPhoto;
    refCote;
    defaultObservateurId;

    constructor(public OES: ObservationEditService,
                private modalCtrl: ModalController,
                private geolocation: GeolocationService,
                private cameraService: CameraService,
                private camera: Camera,
                private file: File,
                private toastCtrl: ToastController,
                private toastService: ToastService,
                private cdr: ChangeDetectorRef,
                private databaseService: DatabaseService,
                private sirsDataService: SirsDataService,
                private permissionsService: PermissionsService) {
        this.view = 'media';
        this.pendingContactList = true;

        this.OES.importPhotoData = null;
        this.OES.mediaOptions.id = '';

        this.sirsDataService.getContactList().then((list) => {
            this.contactList = list;
            this.pendingContactList = false;
        }, (error) => {
            this.pendingContactList = false;
            console.error('error contactList returned : ', error);
        });

        this.sirsDataService.getRefOrientationPhoto().then((list) => {
            this.refOrientationPhoto = list;
        }, (error) => {
            console.error('error refOrientationPhoto returned : ', error);
        });

        this.sirsDataService.getRefCote().then((list) => {
            this.refCote = list;
        }, (error) => {
            console.error('error cotes returned : ', error);
        });
    }

    ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.showTextConfig = config.context.showText;
                this.defaultObservateurId = config.context.defaultObservateurId;

                this.OES.contact = this.defaultObservateurId || '';
                this.OES.mediaOptions.photographeId = this.defaultObservateurId || '';
            });
    }

    cancel() {
        this.viewChange.emit('form');
    }

    setView(str: 'media' | 'map' | 'note') {
        this.view = str;
    }

    showText(str: 'fullName' | 'abstract' | 'both') {
        return this.showTextConfig === str;
    }

    initData() {
        // Create borne position
        if (!this.OES.mediaOptions.systemeRepId) {
            return {
                systemeRepId: '',
                borne_aval: '',
                borne_distance: 0,
                borneId: '',
                borneLibelle: '',
                media: true
            };
        }

        // Edit Debut
        if (this.OES.mediaOptions.systemeRepId) {
            return {
                systemeRepId: this.OES.mediaOptions.systemeRepId,
                borne_aval: this.OES.mediaOptions.borne_debut_aval ? 'true' : 'false',
                borne_distance: this.OES.mediaOptions.borne_debut_distance,
                borneId: this.OES.mediaOptions.borneDebutId,
                borneLibelle: this.OES.mediaOptions.borneDebutLibelle || '',
                media: true
            };
        }
    }

    async selectPosBySR() {
        const data = this.initData();
        const modal = await this.modalCtrl.create({
            component: PositionByBorneModal2Component,
            animated: true,
            cssClass: 'modal-css',
            componentProps: {
                data: data
            }
        });
        return await modal.present();
    }

    editNote() {
        this.setView('note');
    }

    public locateMe(): void {
        if (this.geolocation.isEnabled) {
            this.geolocation.getCurrentLocation().then((position) => {
                this.OES.handlePos(position, this.geolocation.getGPSAccuracy());
            }).catch(err => {
                this.toastService.show(new ToastNotification('Erreur lors de la localisation GPS', 3000));
                this.geolocation.openModal('Erreur lors de la localisation GPS', err.message).then();
                console.warn(err);
            });
        } else {
            this.toastService.show(new ToastNotification('Veuillez activer la localisation GPS', 3000));
        }
    }

    getPhotoFromGallery() {
        this.cameraService.getPhotoFromGallery()
            .then(
                (imageData: string) => {
                    if (this.cameraService.calculateImageSize(imageData) > 1048576) {
                        this.toastCtrl.create({
                            message: 'Veuillez choisir une photo de taille infèrieur à 1.2Mo',
                            duration: 3000
                        }).then(toast => toast.present());
                        return;
                    }
                    const photoId = UuidUtils.generateUuid();
                    const fileName = photoId + '.jpg';
                    this.fillMediaOptions(photoId, fileName);
                    this.OES.importPhotoData = imageData;
                    this.cdr.detectChanges();
                },
                error => console.error(error)
            );
    }

    saveNoteEdit(file) {
        this.savePicture(file);
    }

    takePhoto() {
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
                this.OES.warningSizeMessage();
                file.remove(() => console.debug('File has been removed correctly'));
                return;
            } else {
                this.file.resolveDirectoryUrl(this.OES.mediaPath)
                    .then(
                        (targetDir: DirectoryEntry) => {
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
                                            this.OES.importPhotoData = res;
                                            // Force Image to change
                                            this.cdr.detectChanges();
                                        });
                                });


                            })
                        }
                    );
            }
        });
    }

    warningSizeMessage() {
        this.toastCtrl.create({
            message: 'Veuillez choisir une photo de taille inférieur à 1.2Mo',
            duration: 3000
        }).then(toast => toast.present());
    }

    fillMediaOptions(photoId: string, fileName: string) {
        // Store the photo in the object document.
        this.OES.mediaOptions['id'] = photoId;
        this.OES.mediaOptions['@class'] = 'fr.sirs.core.model' + (PluginUtils.isDependanceAhClass(this.OES.objectType) ? '.PhotoDependance' : '.Photo');
        this.OES.mediaOptions['date'] = formatDate(Date.now(), 'yyyy-MM-dd', 'en-US');
        this.OES.mediaOptions['chemin'] = '/' + fileName;
        this.OES.mediaOptions['valid'] = false;
    }

    save() {
        if (this.OES.mediaOptions.id && this.OES.mediaOptions.id !== '') {
            if (!this.OES.photos) {
                this.OES.doc.photos = [];
            }
            const mediaOptions = Object.assign({}, this.OES.mediaOptions);
            this.OES.doc.photos.push(mediaOptions);
            if (this.OES.importPhotoData) {
                if (typeof this.OES.objectDoc._attachments === 'undefined') {
                    this.OES.objectDoc._attachments = {};
                }

                let isBase64 = this.OES.importPhotoData.indexOf('base64') !== -1;

                const saveBase64 = (txt) => {
                    txt = txt.replace(`data:image/jpeg;base64,`, '');
                    this.OES.objectDoc._attachments[this.OES.mediaOptions.id] = {
                        content_type: 'image/jpeg',
                        data: txt
                    };
                    this.cancel();
                }
                if (isBase64) {
                    saveBase64(this.OES.importPhotoData);
                } else {
                    // Convert url image to blob
                    this.OES.getImage(this.OES.importPhotoData).subscribe(
                        (blob) => {
                            let reader = new FileReader();
                            reader.readAsDataURL(blob);
                            // Convert blob to base64
                            reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                    saveBase64(reader.result);
                                }
                            }
                        },
                        error => console.error(error)
                    );
                }
            }
        } else {
            this.toastCtrl.create({
                message: 'Formulaire d\'ajout de média incomplet: Veuillez au moins ajouter une image/note',
                duration: 7000
            }).then(toast => toast.present());
        }
    }

    changeContact() {
        this.OES.mediaOptions.photographeId = this.OES.contact;
    }

    parseContactName(contact) {
        return contact.doc.nom ? `${contact.doc.nom} ${contact.doc.prenom ? contact.doc.prenom : ''}` : contact.doc.designation;
    }

    isDependance(objectType) {
        return PluginUtils.isDependanceAhClass(objectType);
    }
}
