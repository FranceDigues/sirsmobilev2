import { Injectable } from '@angular/core';
import { StorageService } from '@ionic-lib/lib-storage/storage.service';
import { DatabaseService } from './database.service';
import { LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SystemeEndiguement {

    systemEndiguements = [];
    prelod = true;

    constructor(private dbService: DatabaseService, private loadingCtrl: LoadingController) {
        this.loadingCtrl.create({ message: 'Chargement' })
        .then(
          (loading: HTMLIonLoadingElement) => {
            loading.present();
            this.dbService.getLocalDB().query('Element/byClassAndLinear', {
                startkey: ['fr.sirs.core.model.SystemeEndiguement'],
                endkey: ['fr.sirs.core.model.SystemeEndiguement', {}]
            }).then(
                (results) => {
                    setTimeout(() => {
                        this.systemEndiguements = results.rows;
                        this.systemEndiguements.push({
                            id: 'withoutSystem',
                            value: {
                                libelle: 'Sans système d\'endiguement'
                            }
                        });
                        loading.dismiss();
                    }, 100);
                },
                (err) => {
                    console.error('err Endiguement', err);
                    loading.dismiss();
                }
            );
          }
        );
    }
}

@Injectable({
    providedIn: 'root',
})
export class DigueController {

    digues = [];

    constructor(private dbService: DatabaseService, private loadingCtrl: LoadingController) { }

    getDigues(SEID) {
        this.loadingCtrl.create({message: 'Chargement'})
        .then(
          (loading: HTMLIonLoadingElement) => {
            loading.present();
            const key = SEID === 'withoutSystem' ? null : SEID;
            this.dbService.getLocalDB().query('bySEIdHB', {
                key
            }).then(
                (results) => {
                    this.digues = results.rows;
                    if (SEID === 'withoutSystem') {
                        this.digues.push({
                            id: 'SansDigue',
                            value: {
                                libelle: 'Sans digue'
                            }
                        });
                    }
                    loading.dismiss();
                },
                (err) => {
                    loading.dismiss();
                }
            );
        });
    }
}

@Injectable({
    providedIn: 'root',
})
export class TronconController {

    troncons = [];

    constructor(private dbService: DatabaseService, private appTronconsService: AppTronconsService,
                private storageService: StorageService, private loadingCtrl: LoadingController) { }

    getTroncons(DID) {
        this.loadingCtrl.create({message: 'Chargement'})
        .then(
            (loading: HTMLIonLoadingElement) => {
                loading.present();
                if (DID === 'SansDigue') {
                    this.dbService.getLocalDB().query('Element/byClassAndLinear', {
                        startkey: ['fr.sirs.core.model.TronconDigue'],
                        endkey: ['fr.sirs.core.model.TronconDigue', {}],
                        include_docs: true
                    }).then(
                        (results) => {
                            setTimeout(() => {
                                this.troncons = results.rows.filter((item) => {
                                    return !item.doc.digueId;
                                });
                                loading.dismiss();
                            }, 100);
                        },
                        (err) => {
                            console.error(err);
                            loading.dismiss();
                        }
                    );
                } else {
                    this.dbService.getLocalDB().query('byDigueId', {
                        key: DID
                    }).then(
                        (results) => {
                            setTimeout(() => {
                                this.troncons = results.rows;
                                loading.dismiss();
                            }, 100);
                        },
                        (err) => {
                            console.error(err);
                            loading.dismiss();
                        }
                    );
                }
            }
        );
    }

    isActive(id) {
        return this.appTronconsService.favorites.map((item) => {
            return item.id;
        }).indexOf(id) !== -1;
    }

    toggleLayer(troncon) {
        if (this.isActive(troncon.id)) {
            this.appTronconsService.favorites.splice(this.appTronconsService.favorites
                .map((item) => {
                    return item.id;
                }).indexOf(troncon.id), 1);
        } else {
            this.appTronconsService.favorites.push({
                id: troncon.id,
                libelle: troncon.value.libelle,
                geometry: troncon.value.geometry,
                systemeRepDefautId: troncon.value.systemeRepDefautId,
                borneIds: troncon.value.borneIds
            });
        }
        this.storageService.setItem('AppTronconsFavorities', this.appTronconsService.favorites);
        this.appTronconsService.updated.next('tronçon updated');
    }
}

@Injectable({
    providedIn: 'root',
})
export class AppTronconsService {
    updated = new Subject();
    favorites = [];

    constructor(private storageService: StorageService) {
        this.storageService.getItem('AppTronconsFavorities')
        .then(
            (res: Array<any>) => {
                if (res !== null) {
                    this.favorites = res;
                }
            }
        );
    }
}
