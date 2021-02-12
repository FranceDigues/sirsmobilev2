import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Subject, noop } from 'rxjs';
import { Router } from '@angular/router';
import { MapManagerService, EditionLayer } from './map-manager.service';

@Injectable({
    providedIn: 'root'
})
export class SyncService {

    status: number = 0;
    percent: number = 0;
    completion: string = '0/1';
    synch = null;
    isFirstSync: boolean = false;

    constructor(private dbService: DatabaseService, private insomnia: Insomnia,
                private route: Router, private mapManagerService: MapManagerService, private editionLayer: EditionLayer) {
    }

    cancelSync() {
        this.sync ? this.synch.cancel() : noop();
        this.route.navigateByUrl('/main');
    }

    async sync(firstSync) {
        this.isFirstSync = firstSync;
        this.percent = 0;
        this.completion = '0/1';
        this.status = 1;

        this.insomnia.keepAwake();
        const localDB = await this.dbService.getLocalDB();
        const remoteDB = await this.dbService.getRemoteDB();
        let index = 0;
        const subject = new Subject<any>();
        const options = {live: false, retry: true, batch_size: 1, batches_limit: 1};
        this.synch = PouchDB.sync(localDB, remoteDB, options)
            .on('complete', () => {
                subject.next(++index);
                subject.complete();
            })
            .on('error', (error) => {
                console.error('Error Sync', error);
                subject.error(error);
            })
            .on('change', (info) => {
                console.debug('INFO', info);
            })
            .on('paused', (error) => {
                console.debug('paused', error);
            })
            .on('active', () => {
                console.debug('active');
            })
            .on('denied', (error) => {
                console.debug('denied', error);
            });

        return new Promise((resolve, rejects) => {
            subject.subscribe({
                next: (i) => {
                    this.syncProgress(i);
                },
                complete: async () => {
                    this.syncComplete();
                    resolve('');
                },
                error: async (error) => {
                    this.syncError();
                    rejects(error);
                }
            });
        });
    }

    syncProgress(proceedViews) {
        this.percent = (proceedViews / 1) * 100;
        this.completion = proceedViews + '/1';
    }

    syncComplete() {
        this.insomnia.allowSleepAgain();
        this.dbService.activeDB.lastSync = new Date().getTime();
        this.status = 2;

        setTimeout(() => {
            this.status = 0;
        }, 3000);
        if (!this.isFirstSync) {
            this.mapManagerService.clearAll();
            this.editionLayer.redrawEditionLayerAfterSynchronization();
        }
    }

    syncError() {
        this.insomnia.allowSleepAgain();
        this.status = 3;
    }
}
