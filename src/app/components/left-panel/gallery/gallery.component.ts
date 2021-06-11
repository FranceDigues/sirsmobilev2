import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { LocalDatabase } from '../../../services/local-database.service';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from '../../../services/database.service';
import { Router } from '@angular/router';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

@Component({
    selector: 'left-slide-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
    activeTab = 'documents';
    fileDoc = undefined;
    availableFiles = [];
    selected = undefined;

    constructor(private alertCtrl: AlertController,
                private file: File,
                private router: Router,
                private webview: WebView,
                private fileOpener: FileOpener,
                private localDocument: LocalDatabase,
                private httpClient: HttpClient, private databaseService: DatabaseService) {
    }

    ngOnInit() {
        this.initDirectory();
    }

    setActiveTab(tab) {
        this.activeTab = tab;
        this.fileDoc = undefined;
        this.initDirectory();
    }

    initDirectory() {
        this.file.listDir(this.file.dataDirectory, this.activeTab)
            .then((fileEntries) => {
                const files = [];
                fileEntries.forEach((entry) => {
                    files.push({
                        id: entry.fullPath,
                        label: entry.name,
                        childCount: 0,
                        isDirectory: entry.isDirectory,
                        _entry: entry
                    });
                });
                this.availableFiles = files;
            }, (error) => {
                console.error(error);
            });
    }

    getPhotoPath() {
        return this.selected ? this.webview.convertFileSrc(`${this.file.dataDirectory}medias/${this.selected.label}`) : '';
    }

    open() {
        const url = decodeURI(this.selected._entry.nativeURL);
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

    async deleteFile() {
        const alert = await this.alertCtrl.create({
            backdropDismiss: false,
            header: 'Suppression d\'un fichier',
            message: 'Voulez-vous vraiment supprimer ce fichier ?',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.selected._entry.remove(() => {
                                this.fileDoc = undefined;
                                this.initDirectory();
                            },
                            (error) => {
                                console.error('Error deleting the file', error);
                            },
                            () => {
                                console.error('The file doesn\'t exist');
                            });
                    }
                }
            ]
        });
        await alert.present();
    }

    async deleteAllFiles() {
        const alert = await this.alertCtrl.create({
            backdropDismiss: false,
            header: 'Suppression tous les fichiers',
            message: 'Voulez vous vraiment supprimer tous les fichiers de ce répertoire ?' +
                'NB: Cette operation ne supprime pas les fichiers dans la base de données.',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    handler: () => {
                        const promises = [];
                        this.availableFiles.forEach((file) => {
                            promises.push(file._entry.remove());
                        });
                        Promise.all(promises)
                            .then(
                                (values) => {
                                    // The files has been removes successfully
                                    this.fileDoc = undefined;
                                    this.initDirectory();
                                }
                            );
                    }
                }
            ]
        });
        await alert.present();
    }

    select(node) {
        this.selected = node;
        this.fileDoc = undefined;

        if (!node.isDirectory) {
            this.fileDoc = {
                libelle: node._entry.name,
                description: 'Pas de description.'
            };
        }
    }

    // downloadRemoteDocuments() { // TODO : See with Jordan what the gallery is supposed to display. Right now I don't know if this method is necessary.
    //     this.localDocument.query('getAllFilesAttachments', { attachments: true })
    //     .then(
    //         (results) => {
    //             results.forEach(
    //                 (item) => {
    //                     item.value.attachments.forEach(
    //                         (value, key) => {
    //                             if (!value.content_type.startsWith('image/')) {
    //                                 this.httpClient.head(this.file.externalDataDirectory + 'documents' + '/' + item.value.chemin.substring(item.value.chemin.lastIndexOf('/') + 1))
    //                                 .subscribe(
    //                                     () => {
    //                                         console.log('Working');
    //                                     },
    //                                     () => {
    //                                         this.databaseService.getLocalDB().getAttachment(item.id, key,
    //                                             (err, blob) => {
    //                                                 this.file.resolveDirectoryUrl(this.file.externalDataDirectory + 'documents')
    //                                                 .then(
    //                                                     (targetDir) => {
    //                                                         this.file.getFile(targetDir, item.value.chemin.substring(item.value.chemin.lastIndexOf('/') + 1), { create: true })
    //                                                         .then(
    //                                                             (file) => {
    //                                                                 file.createWriter((fileWriter) => {
    //                                                                     fileWriter.write(blob);
    //                                                                     setTimeout(() => {
    //                                                                         this.file.checkDir(this.file.externalDataDirectory, 'documents')
    //                                                                         .then(
    //                                                                             (directory) => {
    //                                                                                 this.visitDirectory(directory)
    //                                                                                 .then(
    //                                                                                     (files: Array<any>) => {
    //                                                                                         this.availableFiles = files;
    //                                                                                     }
    //                                                                                 );
    //                                                                             }
    //                                                                         );
    //                                                                     }, 10);
    //                                                                 },
    //                                                                 (err) => {
    //                                                                     console.log('Cannot write the data to the file', err);
    //                                                                 });
    //                                                             }
    //                                                         );
    //                                                     }
    //                                                 );
    //                                             });
    //                                     }
    //                                 );
    //                             }
    //                         }
    //                     );
    //                 }
    //             );
    //         }
    //     );
    // }
    // visitDirectory(directory) {
    //     return new Promise((resolve, reject) => {
    //         directory.createReader().readEntries(function (entries) {
    //             var files = [];
    //             entries.forEach((entry) => {
    //                 files.push({
    //                     id: entry.fullPath,
    //                     label: entry.name,
    //                     childCount: 0,
    //                     isDirectory: entry.isDirectory,
    //                     _entry: entry
    //                 });
    //             });
    //             resolve(files);
    //         });
    //     })
    // }

    goBack() {
        this.router.navigateByUrl('/main');
    }

}
