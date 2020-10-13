import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Subject, noop } from 'rxjs';
import { Router } from '@angular/router';
import { AppLayer, EditionLayer } from './layers.service';

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
              private route: Router, private appLayer: AppLayer, private editionLayer: EditionLayer) { }

  cancelSync() {
    this.sync ? this.synch.cancel() : noop();
    console.log('Come back main');
    this.route.navigateByUrl('/main');
  }

  async sync(firstSync) {
    this.isFirstSync = firstSync;
    this.percent = 0;
    this.completion = '0/1';
    this.status = 1;

    this.insomnia.keepAwake();
    console.log('Juste acant ???');
    const localDB = await this.dbService.getLocalDB();
    const remoteDB = await this.dbService.getRemoteDB();
    let index = 0;
    const subject = new Subject<any>();
    const options = {live: false, retry: true, batch_size: 1, batches_limit: 1};
    console.log('Before ?');
    this.synch = PouchDB.sync(localDB, remoteDB, options)
    .on('complete', () => {
      console.log('Next (GOOD)');
      subject.next(++index);
      subject.complete();
    })
    .on('error', (error) => {
      console.log('Error Sync', error);
      subject.error(error);
    })
    .on('change', (info) => {
      console.log('INFO');
      console.log(info);
    })
    .on('paused', (error) => {
      console.log('paused', error);
    })
    .on('active', () => {
      console.log('active');
    })
    .on('denied', (error) => {
      console.log('denied', error);
    });

    return new Promise((resolve, rejects) => {
      subject.subscribe({
        next: (i) => { this.syncProgress(i); },
        complete: async () => { this.syncComplete(); resolve(''); },
        error: async (error) => { this.syncError(); rejects(error); }
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
    console.log('SYNC FINISH');

    setTimeout(() => {
      this.status = 0;
    }, 3000);
    if (!this.isFirstSync) {
      this.appLayer.clearAll();
      this.editionLayer.redrawEditionLayerAfterSynchronization();
    }
  }

  syncError() {
    this.insomnia.allowSleepAgain();
    this.status = 3;
  }
}
