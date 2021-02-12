import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { LocalDatabase } from 'src/app/services/local-database.service';
import { ObservationEditService } from 'src/app/services/observation-edit.service';
import { AlertController } from '@ionic/angular';
import { EditionModeService } from 'src/app/services/edition-mode.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { CameraService } from '@ionic-lib/lib-camera/camera.service';
import { Camera } from '@ionic-native/camera/ngx';
import { UuidUtils } from 'src/app/utils/uuid-utils';
import { formatDate } from '@angular/common';
import { AppLayer } from 'src/app/services/layers.service';
import { Options } from '@ionic-lib/lib-camera/interface.model';
import { File } from '@ionic-native/file/ngx';

@Component({
    selector: 'observation-details',
    templateUrl: './observation-details.component.html',
    styleUrls: ['./observation-details.component.scss'],
})
export class ObservationDetailsComponent implements OnInit {

    @Output() readonly detailsTypeChange = new EventEmitter<any>();

    doc;
    urgencyLabel;
    objectDoc;
    showContent: boolean;
    photos: Array<any>;
    loaded;
    objectId;
    mediaPath;

    constructor(private objectDetails: ObjectDetails, private localDB: LocalDatabase,
                public OES: ObservationEditService, private alertCtrl: AlertController,
                private editionService: EditionModeService, private authService: AuthService,
                private route: Router, private cameraService: CameraService, private camera: Camera,
                private appLayer: AppLayer, private file: File) {
        this.doc = this.objectDetails.selectedObservation;
        this.objectId = this.objectDetails.selectedObject._id;
        this.objectDoc = this.objectDetails.selectedObject;
        this.showContent = true;
        this.loaded = {};

        if (!this.doc.photos) {
            this.doc.photos = [];
        }
        this.photos = Object.assign([], this.doc.photos);
        if (this.doc.urgenceId) {
            this.localDB.get(this.doc.urgenceId).then((result) => {
                this.urgencyLabel = result.libelle;
            });
        }
        if (this.doc.urgenceId) {
            // Acquire label for urgency identifier.
            this.localDB.get(this.doc.urgenceId).then((result) => {
                this.doc.urgencyLabel = result.libelle;
            });
        }
    }

    ngOnInit() {
        this.OES.photos = this.photos;
        this.OES.objectDoc = this.objectDoc;
        this.OES.loaded = this.loaded;
        this.OES.showContent = this.showContent;
        this.OES.doc = this.doc;
    }

    goBack() {
        this.detailsTypeChange.emit();
    }

    editObject() {
        this.route.navigateByUrl('/observation/' + this.objectId + '/' + this.doc.id);
    }

    canShowEditionButtons() {
        if (this.authService.getValue().role === 'USER' || this.authService.getValue().role === 'ADMIN') {
            return true;
        }
        if (this.authService.getValue().role === 'GUEST') {
            return false;
        }
        if (this.authService.getValue().role === 'EXTERN') {
            return this.doc.author && this.authService.getValue()._id === this.doc.author;
        }
    }

    async removePhoto(photo, index) {
        const alert = await this.alertCtrl.create({
            backdropDismiss: false,
            header: 'Suppression d\'une photo',
            message: 'Voulez-vous vraiment supprimer cette photo ?',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.doc.photos.splice(index, 1);
                        this.photos.splice(index, 1);

                        if (this.objectDoc._attachments) {
                            delete this.objectDoc._attachments[photo.id];
                        }

                        this.objectDoc.valid = false;

                        this.objectDoc.dateMaj = new Date().toISOString().split('T')[0];

                        this.objectDoc.editMode = true;

                        this.editionService.saveObject(this.objectDoc);
                    }
                }
            ]
        });
        await alert.present();
    }

    async removeObservation() {
        const alert = await this.alertCtrl.create({
            backdropDismiss: false,
            header: 'Suppression d\'une observation',
            message: 'Voulez-vous vraiment supprimer cette observation ?',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    handler: () => {
                        let array = this.objectDetails.selectedObject.observations;
                        let i = array.length;
                        while (i--) {
                            if (array[i].id === this.OES.doc.id) {
                                // Delete the photos of the observation
                                for (var j = 0; j < array[i].photos.length; j++) {
                                    delete this.objectDetails.selectedObject._attachments[array[i].photos[j].id];
                                }

                                array.splice(i, 1);
                                break;
                            }
                        }
                        this.localDB.save(this.objectDetails.selectedObject).then(() => {
                            // Return to the selection list view.
                            this.goBack();
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    getTargetObservation() {
        let i = this.objectDoc.observations.length;
        while (i--) {
            if (this.objectDoc.observations[i].id === this.doc.id) {
                return this.objectDoc.observations[i];
            }
        }
        throw new Error('No observation "' + this.doc.id + '" found in disorder document.');
    }

    addPhotoFromAlbum() {
        const options: Options = {
            quality: 50,
            encodingType: this.camera.EncodingType.JPEG,
            destinationType: this.camera.DestinationType.DATA_URL,
        };
        this.cameraService.getPhotoFromGallery(options)
            .then(
                (imageData: string) => {
                    if (imageData) {
                        this.addPhotoInArray(imageData);
                    }
                }
            );
    }

    addPhotoInArray(imageData) {
        if (this.calculateImageSize(imageData) > 1048576) {
            this.OES.warningSizeMessage();
            return;
        }

        let photoId = UuidUtils.generateUuid();
        let fileName = photoId + '.jpg';

        if (!this.objectDoc._attachments) {
            this.objectDoc._attachments = {};
        }
        const photo = {
            'id': photoId,
            '@class': 'fr.sirs.core.model.Photo',
            'date': formatDate(Date.now(), 'yyyy-MM-dd', 'en-US'),
            'chemin': '/' + fileName,
            'valid': false
        };
        this.doc.photos.push(photo);
        Object.assign(this.getTargetObservation(), this.doc);
        this.objectDoc._attachments[photoId] = {
            content_type: 'image/jpeg',
            data: imageData.replace('data:image/jpeg;base64,', '')
        };

        this.objectDoc.valid = false;
        this.objectDoc.editMode = true;
        this.editionService.saveObject(this.objectDoc)
            .then(
                () => {
                    this.appLayer.syncAllAppLayer();
                    this.photos.push(photo);
                    // TODO HILMI RELOAD COMPONENT
                }
            )
    }

    calculateImageSize(base64String) {
        let padding = 0;

        if (base64String.endsWith('==')) {
            padding = 2;
        } else if (base64String.endsWith('=')) {
            padding = 1;
        }
        const base64StringLength = base64String.length;
        return (base64StringLength / 4) * 3 - padding;
    }

}
