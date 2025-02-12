import { HttpClient } from '@angular/common/http';
import {Injectable, NgZone} from '@angular/core';
import { timeout } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Subject, noop } from 'rxjs';
import { Router } from '@angular/router';
import { MapManagerService } from './map-manager.service';
import { EditionLayerService } from './edition-layer.service';
import { EditionModeService } from "./edition-mode.service";

@Injectable({providedIn: 'root'})
export class SyncService {
    public status: number = 0;
    public percent: number = 0;
    public completion: string = '0/1';
    private synch: any;
    private isFirstSync: boolean = false;
    private _error: string = '';
    public doc_write_failures: string ='';
    public batchSize: number ;
    constructor(private dbService: DatabaseService,
                private insomnia: Insomnia,
                private route: Router,
                private mapManagerService: MapManagerService,
                private editionLayerService: EditionLayerService,
                private editionModeService: EditionModeService,
                private zone: NgZone,
                private http: HttpClient) {
        this.batchSize = 1;
    }

    public cancelSync() {
        this.sync ? this.synch.cancel() : noop();
        this.route.navigateByUrl('/main').then();
    }

    public sync(firstSync): Promise<string> {
        return new Promise<string>(async (resolve, rejects) => {
            this.isFirstSync = firstSync;
            this.percent = 0;
            this.completion = '0 documents traités';
            this.doc_write_failures = "0 erreur de sync";
            this.status = 1;
            this._error = '';

            await this.insomnia.keepAwake();

            const localDB = await this.dbService.getLocalDB();
            const remoteDB = await this.dbService.getRemoteDB();

            let index = 0;
            let sentDocs = 0;
            let receivedDocs= 0;
            let errosPullDocs: number = 0;
            let errosPushDocs:  number = 0;
            const subject = new Subject<any>();
            const options = {live: false, retry: false, batch_size: this.batchSize, batches_limit: this.batchSize};

            console.debug('[Sync Service] Starting sync');

            const settings: any = await this.dbService.getCurrentDatabaseSettings();

            const auth = `Basic ${btoa(settings.userId + ':' + settings.password)}`;

            this.http.head(this.dbService.activeDB.url, {headers: {Authorization: auth}}).pipe(timeout(5 * 1000)).subscribe(() => { // Allow to check if the server is online
                this.synch = PouchDB.sync(localDB, remoteDB, options)
                    .on('complete', () => {
                        console.debug('[Sync Service] Sync complete');
                        subject.complete();
                    })
                    .on('error', (error) => {
                        console.warn('[Sync Service] Error duuring sync', error);
                        subject.error(new Error('Une erreur s\'est produite durant la synchronisation de la base de données, veuillez réessayer.'));
                    })
                    .on('change', (info) => {
                        if (info.direction === 'push') {
                            sentDocs = info.change.docs_written ;
                            errosPullDocs = info.change.doc_write_failures;
                        } else if (info.direction === 'pull') {
                            receivedDocs = info.change.docs_written ;
                            errosPushDocs = info.change.doc_write_failures;
                        }

                        this.zone.run(() => {
                            this.completion = `${sentDocs + receivedDocs} documents traités`;
                            this.doc_write_failures = `${errosPullDocs + errosPushDocs } erreur(s) de sync`;
                        });
                        subject.next(this.completion );
                        console.debug('[Sync Service] change', info);
                    })
                    .on('active', () => {
                        console.debug('[Sync Service] Sync active');
                    })
                    .on('denied', (error) => {
                        console.warn('[Sync Service] Access denied', error);
                        subject.error(new Error('Impossible de synchroniser, droits manquants pour cet utilisateur dans la base de données.\n' + error.result));
                    });
            }, (error) => {
                console.warn('Cannot reach the server');
                subject.error(new Error('Impossible de contacter le serveur. Vérifiez votre connection internet et l\'état du serveur distant.'));
            });

            subject.subscribe({
                next: (i) => {
                    console.log("next");
                   // this.syncProgress(i);
                },
                complete: async () => {
                    console.log("complete");
                    this.syncComplete();
                    resolve('');
                },
                error: async (error) => {
                    console.log("error : ", error);
                    this._error = error.message;
                    this.syncError();
                    rejects(error);
                }
            });
        });
    }

    private syncProgress(proceedViews) {
        this.percent = (proceedViews / 1) * 100;
        this.completion = proceedViews + '/1';
    }

    private syncComplete() {
        this.insomnia.allowSleepAgain().then();
        this.dbService.activeDB.lastSync = new Date().getTime();
        this.status = 2;

        setTimeout(() => {
            this.status = 0;
        }, 3000);
        if (!this.isFirstSync) {
            this.mapManagerService.clearAll();
            this.editionLayerService.redrawEditionLayerAfterSynchronization();
        }
    }

    private syncError() {
        this.insomnia.allowSleepAgain().then();
        this.status = 3;
    }

    get error(): string {
        return this._error;
    }
}
