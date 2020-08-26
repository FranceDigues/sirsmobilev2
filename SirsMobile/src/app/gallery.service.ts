import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { FileOpener } from '@ionic-native/file-opener/ngx';
// import { File } from '@ionic-native/file/ngx';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from './database.service';
import { LocalDatabase } from './usingLocalDatabase.service';


@Injectable({
    providedIn: 'root',
})
export class GalleryService {

    activeTab = 'documents';
    fileDoc = undefined;
    availableFiles = [];
    selected = undefined;

    constructor(private alertCtrl: AlertController, private localDocument: LocalDatabase,
                private http: HttpClient, private databaseService: DatabaseService) { }

    setActiveTab(tab) {
        this.activeTab = tab;
        this.fileDoc = undefined;
        this.initDirectory();
    }

    initDirectory() { // TODO
        console.log('hey !');
        // this.file.checkDir(this.file.externalDataDirectory, this.activeTab)
        // .then(
        //     () => {
        //         this.file.resolveDirectoryUrl(this.file.externalDataDirectory + this.activeTab)
        //         .then(
        //             (directory) => {
        //                 this.visitDirectory(directory)
        //                 .then(
        //                     (files) => {
        //                         console.log('files', files)
        //                         this.availableFiles = files;
        //                     },
        //                     (err) => {
        //                         console.log('error', err);
        //                     }
        //                 )
        //             }
        //         )
        //         let directory = null
        //         console.log('directory', directory);
        //     },
        //     (err) => {
        //         this.file.createDir(this.file.externalDataDirectory, this.activeTab, true)
        //         .then(
        //             (directory) => {
        //                 this.file.createFile(this.file.externalDataDirectory + this.activeTab + '/', '_keepMtpOpen', true)
        //                 .then(
        //                     () => {
        //                         this.initDirectory();
        //                     }
        //                 )
        //             }
        //         )
        //     }
        // )
    }

    visitDirectory(directory): Promise<Array<object>> {
        return new Promise((resolve, rejects) => {
            let files = [];
            directory.createReader().readEntries(
                (entries) => {
                    entries.forEach((entry) => {
                        files.push({
                            id: entry.fullPath,
                            label: entry.name,
                            childCount: 0,
                            isDirectory: entry.isDirectory,
                            _entry: entry
                        });
                    });
                },
                (err) => {
                    rejects(err);
                }
            )
            resolve(files)
        })
    }

    getPhotoPath() {
        return this.selected ? decodeURI(this.selected._entry.nativeURL) : '';
    }

    open() { // TODO
        // this.fileOpener.open(
        //     decodeURI(this.selected._entry.nativeURL),
        // 'image/jpeg',)
        // .then(
        //     () => {
        //         console.log('file opened successfully');
        //     },
        //     (error) => {
        //         console.log('err', error);
        //     }
        // );
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
                            console.log('The file has been removed successfully');
                            this.fileDoc = undefined;
                            this.initDirectory();
                        },
                        (error) => {
                            console.log('Error deleting the file', error);
                        },
                        () => {
                            console.log('The file doesn\'t exist');
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
                        let promises = [];
                        this.availableFiles.forEach((file) => {
                            promises.push(file._entry.remove());
                        });
                        Promise.all(promises)
                        .then(
                            (values) => {
                                console.log('values ?', values);
                                console.log('The files has been removes successfully');
                                this.fileDoc = undefined;
                                this.initDirectory();
                            }
                        )
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

    downloadRemoteDocuments() { // TODO
        // this.localDocument.query('getAllFilesAttachments', { attachments: true })
        // .then(
        //     (results) => {
        //         console.log('results', results);
        //         results.forEach(
        //             (item) => {
        //                 console.log('item', item);
        //                 item.value.attachments.forEach(
        //                     (value, key) => {
        //                         if (!value.content_type.startsWith('image/')) {
        //                             this.http.head(this.file.externalDataDirectory + 'documents' + '/' + item.value.chemin.substring(item.value.chemin.lastIndexOf('/') + 1))
        //                             .subscribe(
        //                                 () => {
        //                                     console.log('Working');
        //                                 },
        //                                 () => {
        //                                     this.databaseService.getLocalDB().getAttachment(item.id, key,
        //                                         (err, blob) => {
        //                                             this.file.resolveDirectoryUrl(this.file.externalDataDirectory + 'documents')
        //                                             .then(
        //                                                 (targetDir) => {
        //                                                     this.file.getFile(targetDir, item.value.chemin.substring(item.value.chemin.lastIndexOf('/') + 1), { create: true })
        //                                                     .then(
        //                                                         (file) => {
        //                                                             file.createWriter((fileWriter) => {
        //                                                                 fileWriter.write(blob);
        //                                                                 setTimeout(() => {
        //                                                                     this.file.checkDir(this.file.externalDataDirectory, 'documents')
        //                                                                     .then(
        //                                                                         (directory) => {
        //                                                                             this.visitDirectory(directory)
        //                                                                             .then(
        //                                                                                 (files) => {
        //                                                                                     this.availableFiles = files;
        //                                                                                 }
        //                                                                             );
        //                                                                         }
        //                                                                     );
        //                                                                 }, 10);
        //                                                             },
        //                                                             (err) => {
        //                                                                 console.log('Cannot write the data to the file', err);
        //                                                             });
        //                                                         }
        //                                                     );
        //                                                 }
        //                                             );
        //                                         });
        //                                 }
        //                             );
        //                         }
        //                     }
        //                 );
        //             }
        //         );
        //     }
        // );
    }
}
