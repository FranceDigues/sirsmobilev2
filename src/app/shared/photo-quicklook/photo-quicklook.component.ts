import { ApplicationRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, DirectoryEntry, FileEntry } from '@ionic-native/file/ngx';
import { LocalDatabase } from '../../services/local-database.service';
import { AlertController } from '@ionic/angular';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ToastNotification } from "../models/toast-notification.model";
import { ObservationEditService } from "../../services/observation-edit.service";

@Component({
    selector: 'photo-quicklook',
    templateUrl: './photo-quicklook.component.html',
    styleUrls: ['./photo-quicklook.component.scss'],
})
export class PhotoQuicklookComponent implements OnInit {
    @Input() photo;
    @Input() objectDoc;
    @Output() removePhotoEvent = new EventEmitter();
    public loaded = false;
    mediaPath: string;

    constructor(private httpClient: HttpClient,
                private file: File,
                private fileOpener: FileOpener,
                private webview: WebView,
                private localDB: LocalDatabase,
                public alertController: AlertController,
                private ref: ApplicationRef) {
    }

    ngOnInit() {
        this.mediaPath = `${this.file.dataDirectory}medias`;
        if (this.photo) {
            this.loadImage(this.photo);
        }
    }

    async openPhoto(photo) {
        const fileEntries = await this.file.listDir(this.file.dataDirectory, 'medias');
        const find = fileEntries.find(item => item.name === `${photo.id}.jpg`);
        if (find) {
            const url = decodeURI(find.nativeURL);
            this.fileOpener.open(url, 'image/jpeg')
                .then(
                    () => {
                        console.debug('File opened successfully');
                    },
                    (error) => {
                        console.error('Error open method :', error);
                    }
                );
        }
    }

    getPhotoPath(photo, details?) {
        let path = (details) ? `${photo.id}.jpg` : `${photo.id}${photo.chemin.substring(photo.chemin.indexOf('.')).toLowerCase()}`;
        path = `${this.file.dataDirectory}medias/${path}`;
        return this.webview.convertFileSrc(path);
    }

    loadImage(photo, details?) {
        const imageUrl = this.getPhotoPath(photo, details);
        this.httpClient.head(imageUrl, {headers: {'Accept': 'image/*'}, responseType: 'blob'}).subscribe(
            () => {
                this.loaded = true;
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
                                            this.loaded = true;
                                            this.ref.tick(); // Force Ionic to detect changes
                                        };
                                        fileWriter.write(blob);
                                    }, () => {
                                        console.warn('Error while creating DB filewriter');
                                        this.loaded = true;
                                        this.ref.tick(); // Force Ionic to detect changes
                                    });
                                });
                            });
                    } else {
                        console.warn('No attachment available');
                        this.loaded = true;
                        this.ref.tick(); // Force Ionic to detect changes
                    }
                } else {
                    console.warn(`missing image attachment, DB model not respected.`)
                    this.loaded = true;
                    this.ref.tick(); // Force Ionic to detect changes
                }
            });
    }

    async removePhoto() {
        const alert = await this.alertController.create({
            header: `Suppression d'une photo`,
            message: `Voulez vous supprimer cette photo ?`,
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Valider',
                    handler: () => {
                        this.removePhotoEvent.emit(this.photo);
                    }
                }
            ]
        });

        await alert.present();
    }

}
