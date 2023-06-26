import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { forkJoin, Subject } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from 'src/app/components/database-connection/models/database.model';
import { designDocs, indexedViews } from './couchDB-Vues';
import { AlertController } from '@ionic/angular';
import { Insomnia } from '@ionic-native/insomnia/ngx';

@Component({
  selector: 'app-replicate-database',
  templateUrl: './replicate-database.component.html',
  styleUrls: ['./replicate-database.component.scss']
})
export class ReplicateDatabaseComponent implements OnInit, OnDestroy {

  @Input() databaseIndex;
  @Output() readonly statusChange = new EventEmitter<any>();

  step;
  description;
  percent;
  completion;
  databases: Array<DatabaseModel>;
  activeDb: DatabaseModel;
  remoteDB;
  localDB;

  indexPromises = []; // Set as global to be accessed by he html.

  constructor(private nativeStorage: NativeStorage, private dbService: DatabaseService,
              private router: Router, private route: ActivatedRoute, private alertCtrl: AlertController,
              private insomnia: Insomnia, private zone: NgZone) {
      this.step = 0;
      this.description = 'Loading...';
      this.percent = 0;
      this.completion = null;
    }

  ngOnInit() {
    this.insomnia.keepAwake();
    this.dbService.getDatabaseSettings()
    .then(
      async (databases) => {
        this.databases = databases;
        this.activeDb = this.databases[this.databaseIndex];
        this.localDB = await this.dbService.getLocalDB();
        this.remoteDB = await this.dbService.getRemoteDB();
        this.zone.run(() => this.firstStep());
      },
      (error) => {
        console.error('no databases in HardDisk ' + error);
      }
    );
  }

  ngOnDestroy(): void {
    this.insomnia.allowSleepAgain();
  }

  firstStep() {
    this.step = 1;
    this.description = 'Connexion à la base de données...';
    this.percent = 0;
    this.completion = null;
    this.remoteDB.info()
    .then(
      (result) => {
        this.zone.run(() => this.firstStepComplete(result.doc_count + result.doc_del_count));
      },
      (err) => {
        this.zone.run(() => this.firstStepError(err));
      }
    );
  }

  firstStepComplete(docCount) {
    this.percent = 100;
    this.zone.run(() =>  this.secondStep(docCount));
  }

  async firstStepError(error) {
    console.error(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Erreur',
      message: 'Une erreur s\'est produite lors de la connexion à la base de données.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    });
    await alert.present();
  }

  secondStep(docCount) {
    this.step = 2;
    this.description = 'Téléchargement des documents...';
    this.percent = 0;
    this.completion = '0/' + docCount;

    const subject = new Subject<any>();
    this.remoteDB.replicate.to(this.localDB, { live: false, retry: true, batches_limit: 10, batch_size: 100 })
    .on('change', (result) => {
      console.log('2 - En COURS : ', result);
      const arg = {
        repCount: Math.min(result.docs_written, docCount),
        docCount
      };
      subject.next(arg);
    })
    .on('complete', () => {
      console.log('2 - COMPLETE');
      subject.complete();
    })
    .on('paused', (err) => {
      console.log('paused', err);
    })
    .on('denied', (err) => {
      console.log('denied', err);
    })
    .on('error', (error) => {
      console.warn(error);
      subject.error(error);
    });

    subject.subscribe({
      next: (state) => {
        this.zone.run(() => this.secondStepProgress(state.repCount, state.docCount));
      },
      complete: () => {
        this.zone.run(() => this.secondStepComplete());
      },
      error: (error) => {
        this.zone.run(() => this.secondStepError(error));
      }
    });
  }

  secondStepProgress(repCount, docCount)  {
    this.percent =  repCount / docCount * 100;
    this.completion = repCount + '/' + docCount;
  }

  secondStepComplete() {
    this.thirdStep();
  }

  async secondStepError(error) {
    console.error(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Erreur',
      message: 'Une erreur s\'est produite lors du téléchargement des documents.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    });
    await alert.present();
  }

  thirdStep() {
    this.step = 3;
    this.description = 'Préparation de l\'espace de travail...';
    this.percent = 0;
    this.completion = '0/' + designDocs.length;

    const promises = [];

    designDocs.forEach((element, i) => {
      const promise = new Promise((resolve, reject) => {
        this.localDB.put(element).then(
            () => {
              console.debug('3 - EN COURS');
              this.thirdStepProgess(i + 1);
              resolve();
            },
            (error) => {
              console.debug('SECOND CASE', error, element);
              if (error.status === 409) { // doc already exist
                // Force update
                this.localDB.get(element._id).then(
                    (doc) => {
                      return this.localDB.put({
                        _id: element._id,
                        _rev: doc._rev,
                        views: element.views
                      }).then(
                          () => {
                            this.thirdStepProgess(i + 1);
                            console.debug('3 - COMPLETE');
                            resolve();
                          },
                          (error) => {
                            console.debug('SECOND CASE', error, element);
                            reject(error);
                          }
                      )
                    },
                    (error) => {
                      console.debug('SECOND CASE', error, element);
                      reject(error);
                    }
                )
              } else {
                reject(error);
              }
            });
        });
      promises.push(promise);
    });


    Promise.all(promises).then(() => {
      this.thirdStepComplete();
    }).catch(error => {
      console.warn(error);
      this.thirdStepError(error).then();
    });
  }

  thirdStepProgess(proceedDocs) {
    this.percent = (proceedDocs / designDocs.length) * 100;
    this.completion = proceedDocs + '/' + designDocs.length;
    console.debug('THIRD PROGRESS : ' + proceedDocs);
  }

  thirdStepComplete() {
    console.debug('3 - REAL COMPLETE');
    this.fourthStep();
  }

  async thirdStepError(error) {
    console.error(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Erreur',
      message: 'Une erreur s\'est produite lors de la préparation de l\'espace de travail.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    });
    await alert.present();
  }

  fourthStep() {
    console.debug('[Replication] Indexing database ...');
    this.step = 4;
    this.description = 'Préparation de la base de donnée';
    this.percent = 0;
    this.completion = '';

    const promises: Promise<any>[] = [];
    let proceedViews = 0;

    for (const view of indexedViews) {
      const query: Promise<void> = this.localDB.query(view, {limit: 0});

      promises.push(query);
    }

    for (const promise of promises) {
      promise.then(() => {
        this.description = 'Construction des indexes';
        proceedViews++;
        // this.completion = proceedViews + '/' + indexedViews.length;
        this.fourthStepProgress(proceedViews);
        if (proceedViews === indexedViews.length) {
          this.fourthStepComplete();
          console.debug('[Replication] Database indexed ...');
        }
      }).catch((error) => {
        this.fourthStepError(error).then();
      });
    }
  }

  fourthStepProgress(proceedViews) {
    this.percent = (proceedViews / indexedViews.length) * 100;
    console.debug('[Replication] Indexing progress: ' + proceedViews);
    // this.completion = proceedViews + '/' + indexedViews.length;
  }

  fourthStepComplete() {
    this.fifthStep();
  }

  async fourthStepError(error) {
    console.error(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Erreur',
      message: 'Une erreur s\'est produite lors de la construction des index.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    });
    await alert.present();
  }

  fifthStep() {
    this.step = 5;
    this.description = 'Synchronisation avec la base de données distante...';
    this.percent = 0;
    this.completion = '0/1';

    const options = { live: false, retry: false };
    this.localDB.sync(this.remoteDB, options)
    .on('complete', () => {
      this.completion = '1/1';
      this.percent = 100;
      this.fifthStepComplete();
    })
    .on('error', (error) => {
      this.fifthStepError(error);
    });
  }

  fifthStepComplete() {
    this.databases[this.databaseIndex].replicated = true;
    this.dbService.saveDatabaseSettings(this.databases);
    this.statusChange.emit(4);
  }

  async fifthStepError(error) {
    console.error(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Erreur',
      message: 'Une erreur s\'est produite lors de la synchronisation',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    });
    await alert.present();
  }

  backToDatabase() {
    this.statusChange.emit(0);
  }

}
