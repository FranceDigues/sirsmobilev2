import { Injectable } from '@angular/core';
import { StorageService } from '@lib-storage/storage.service';
import { DatabaseService } from './database.service';
import { LocalDatabase } from './usingLocalDatabase.service';

@Injectable({
    providedIn: 'root',
})
export class SystemeEndiguement {

    systemEndiguements = [];
    prelod = true;

    constructor(private dbService: DatabaseService) {
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
                }, 100)
            },
            (err) => {
                console.log('err Endiguement', err);
            }
        );
    }
}

@Injectable({
    providedIn: 'root',
})
export class DigueController {

    digues = [];

    constructor(private dbService: DatabaseService) { }

    getDigues(SEID) {
        let key = SEID === "withoutSystem" ? null : SEID;
        this.dbService.getLocalDB().query('bySEIdHB', {
            key: key
        })
        .then(
            (results) => {
                this.digues = results.rows;
                if (SEID === "withoutSystem") {
                    this.digues.push({
                        id: 'SansDigue',
                        value: {
                            libelle: "Sans digue"
                        }
                    });
                }
            },
            (err) => {
                console.log('err Digue', err);
            }
        )
    }
}

@Injectable({
    providedIn: 'root',
})
export class TronconController {

    troncons = [];

    constructor(private dbService: DatabaseService, private appTronconsService: AppTronconsService,
                private storageService: StorageService) { }

    getTroncons(DID) {
        if (DID === "SansDigue") {
            this.dbService.getLocalDB().query('Element/byClassAndLinear', {
                startkey: ['fr.sirs.core.model.TronconDigue'],
                endkey: ['fr.sirs.core.model.TronconDigue', {}],
                include_docs: true
            })
            .then(
                (results) => {
                    setTimeout(() => {
                        this.troncons = results.rows.filter((item) => {
                            return !item.doc.digueId;
                        });
                    }, 100);
                },
                (err) => {
                console.log(err);
                }
            );
        } else {
            this.dbService.getLocalDB().query('byDigueId', {
                key: DID
            })
            .then(
                (results) => {
                    setTimeout(() => {
                        this.troncons = results.rows;
                    }, 100);
                },
                (err) => {
                    console.log(err);
                }
            );
        }
    }

    isActive(id) {
        return this.appTronconsService.favorites.map((item) => {
            return item.id;
        }).indexOf(id) !== -1;
    }

    toggleLayer(troncon) {
        if (this.isActive(troncon.id)) {
            this.appTronconsService.favorites.splice(this.appTronconsService.favorites
                .map(function (item) {
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
    }
}


@Injectable({
    providedIn: 'root',
})
export class AppTronconsService {

    favorites = [];

    constructor(private storageService: StorageService) {
        this.storageService.getItem('AppTronconsFavorities')
        .then(
            (res) => {
                if (res !== null) {
                    this.favorites = res;
                }
            }
        );
    }
}
