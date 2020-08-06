import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Subject, noop } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private dbService: DatabaseService, private insomnia: Insomnia, private route: Router) { }

  cancelSync() {
    this.sync ? this.synch.cancel() : noop();
    this.route.navigateByUrl('/main');
  }

  async sync() {
    this.percent = 0;
    this.completion = '0/1';
    this.status = 1;

    this.insomnia.keepAwake();
    this.localDB = await this.dbService.getLocalDB();
    this.remoteDB = await this.dbService.getRemoteDB();
    let index = 0;
    const subject = new Subject<any>();
    const options = {live: false, retry: true, batch_size: 1, batches_limit: 1};
    console.log('Before ?');
    this.synch = PouchDB.sync(this.localDB, this.remoteDB, options)
    .on('complete', () => {
      subject.next(++index);
      subject.complete();
    })
    .on('error', (error) => {
      console.log('After');
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

    subject.subscribe({
      next: (i) => { this.syncProgress(i); },
      complete: () => { this.syncComplete(); },
      error: (error) => { this.syncError(error); return; }
    });
  }

  syncProgress(proceedViews) {
    this.percent = (proceedViews / 1) * 100;
    this.completion = proceedViews + '/1';
  }

  syncComplete() {
    this.insomnia.allowSleepAgain();
    setTimeout(
      () => {
        this.dbService.activeDB.lastSync = new Date().getTime();
        this.status = 2;
        console.log('SYNC FINISH');
        // TODO MAP MANAGER CLEAR ALL
        // TODO REDRAW EDITION LAYER AFTER SYNCHRONIZATION
      }, 1000);
  }

  syncError(error) {
    console.log(error);
    this.insomnia.allowSleepAgain();
    setTimeout(() => {
      this.status = 3;
    }, 1000);
  }
}
