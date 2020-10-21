import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ObjectDetails } from './objectdetails.service';
import { LocalDatabase } from './usingLocalDatabase.service';
import { File } from '@ionic-native/file/ngx';
import { formatDate } from '@angular/common';

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


    constructor(private objectDetails: ObjectDetails,
                private localDB: LocalDatabase, private file: File, private http: HttpClient,
                private fileOpener: FileOpener) {
                    this.mediaPath = this.file.externalDataDirectory + 'medias';
                    this.showContent = true;
                    this.loaded = {};
                }

    init(objectId: string, obsId: string) {
        this.setValuesToDefault();

        this.objectDoc = this.objectDetails.selectedObject;
        const lastIndexOfClass = this.objectDoc['@class'].lastIndexOf('.');
        this.objectType = this.objectDoc['@class']
        .substring(lastIndexOfClass + 1);

        this.objectId = objectId;
        this.obsId = obsId;
        this.isNewObject = !this.obsId;

        this.doc = this.isNewObject ? this.createNewObservation() : Object.assign({}, this.getTargetObservation());
        this.photos = this.doc.photos;
    }

    setValuesToDefault() {

    }

    createNewObservation() {
        let newObj = {
            'id': uuid4.generate(),
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
                newObj['urgenceId'] = "RefUrgence:1";
                newObj['nombreDesordres'] = 0;
                return newObj;
        };
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

    getPhotoPath(photo) {
        let path = photo.id + photo.chemin.substring(photo.chemin.indexOf('.')).toLowerCase();
        let image_url = this.mediaPath + '/' + path;
        return image_url;
    }

    loadImage(photo) {
        let image_url = this.getPhotoPath(photo);
        this.http.head(image_url, {}).subscribe(
        () => {
            this.loaded[photo.id] = true;
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
                                        case "image/jpeg":
                                            ext = ".jpg";
                                            break;
                                        case "image/png":
                                            ext = ".png";
                                            break;
                                        case "image/gif":
                                            ext = ".gif";
                                            break;
                                        case "image/tiff":
                                            ext = ".tif";
                                            break;
                                    }
                                    fileName = keyAttachment + ext;
                                }
                                this.showContent = false;
                                this.file.resolveDirectoryUrl(this.mediaPath)
                                .then((targetDir: DirectoryEntry) => {
                                    targetDir.getFile(fileName, {create: true}, (file: FileEntry) => {
                                        file.createWriter((fileWriter) => {
                                            fileWriter.write(blobImage);
                                            this.loaded[photo.id] = true;
                                            this.showContent = true;
                                        }, () => {
                                            console.log('cannot write the data to the file');
                                            this.loaded[photo.id] = true;
                                        });
                                    });
                                });
                            },
                            (err) => {
                                console.error(err);
                            });
                } else {
                    this.loaded[photo.id] = true;
                    console.log("no attachment exit to load image");
                }
            } else {
                this.loaded[photo.id] = true;
            }
        });
    }

    open(photo) {
        const url = this.getPhotoPath(photo);

        this.fileOpener.open(decodeURI(url), 'image/jpeg')
        .then(
            () => {
                console.log('File opened successfully');
            },
            (error) => {
                console.log('Error open method :', error);
            }
        )
    }

}
