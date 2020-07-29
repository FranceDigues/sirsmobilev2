import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  status = 0;
  localDB;
  remoteDB;
  percent;
  completion;
  synch = null;

  constructor(private dbService: DatabaseService, private insomnia: Insomnia) {
    this.localDB = this.dbService.getLocalDB();
    this.remoteDB = this.dbService.getRemoteDB();
  }

  cancelSync() {
    // this.sync ? this.sync.cancel() : () => {}; // TODO this not working
    // TODO GO PATH /MAIN
  }

  sync() {
    this.percent = 0;
    this.completion = '0/1';
    this.status = 1;

    this.insomnia.keepAwake();
    let index = 0;
    const subject = new Subject<any>();
    const options = {live: false, retry: true, batch_size: 1, batches_limit: 1};
    this.sync = PouchDB.sync(this.localDB, this.remoteDB, options)
    .on('complete', () => {
      subject.next(++index);
      subject.complete();
    })
    .on('error', (error) => {
      subject.error(error);
    })
    .on('change', (info) => {
      console.log("INFO");
      console.log(info);
    })
    .on('paused', (error) => {
      console.log("paused", error);
    })
    .on('active', () => {
      console.log("active");
    })
    .on('denied', (error) => {
      console.log("denied", error);
    })

    subject.subscribe({
      next: (index) => { this.syncProgress(index); },
      complete: () => { this.syncComplete(); },
      error: (error) => { this.syncError(error) }
    })
  }

  syncProgress(proceedViews) {
    this.percent = (proceedViews / 1) * 100;
    this.completion = proceedViews + '/1'
  }

  syncComplete() {
    this.insomnia.allowSleepAgain();
    setTimeout(
      () => {
        this.dbService.activeDB.lastSync = new Date().getTime();
        this.status = 2;
        // TODO MAP MANAGER CLEAR ALL
        // TODO REDRAW EDITION LAYER AFTER SYNCHRONIZATION
      }, 1000)
  }

  syncError(error) {
    console.log(error);
    this.insomnia.allowSleepAgain();
    setTimeout(() => {
      this.status = 3;
    }, 1000);
  }
}
