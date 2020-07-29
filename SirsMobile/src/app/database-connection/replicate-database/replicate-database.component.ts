import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Subject } from 'rxjs';
import { DatabaseService } from './../../database.service';
import { DatabaseModel } from 'src/app/models/database.model';
import { designDocs, indexedViews } from './couchDB-Vues';
import { AlertController } from '@ionic/angular';
import { Insomnia } from '@ionic-native/insomnia/ngx';

@Component({
  selector: 'app-replicate-database',
  templateUrl: './replicate-database.component.html',
  styleUrls: ['./replicate-database.component.scss']
})
export class ReplicateDatabaseComponent implements OnInit, OnDestroy {

  @Input() databaseIndex: number;
  @Output() readonly statusChange = new EventEmitter<Number>()

  step;
  description;
  percent;
  completion;
  databases: Array<DatabaseModel>;
  activeDb: DatabaseModel;
  remoteDB;
  localDB;

  constructor(private nativeStorage: NativeStorage,
    private dbService: DatabaseService, private router: Router, private route: ActivatedRoute,
    private alertCtrl: AlertController, private insomnia: Insomnia) {
      this.step = 0;
      this.description = "Loading...";
      this.percent = 0;
      this.completion = null;
    }

  ngOnInit() {
    this.insomnia.keepAwake();
    this.dbService.getDatabasesHardDisk()
    .then(
      async (databases) => {
        this.databases = databases
        this.activeDb = this.databases[this.databaseIndex];
        this.localDB = this.dbService.getLocalDB();
        this.remoteDB = await this.dbService.getRemoteDB();
        this.firstStep();
      },
      (error) => {
        console.log("no 'databases' in HardDisk " + error);
      }
    );
  }

  ngOnDestroy(): void {
    this.insomnia.allowSleepAgain();
  }

  firstStep() {
    this.step = 1;
    this.description = "Connexion à la base de données...";
    this.percent = 0;
    this.completion = null;
    this.remoteDB.info()
    .then(
      (result) => {
        console.log(result);
        this.firstStepComplete(result.doc_count);
      },
      (err) => {
        this.firstStepError(err);
      }
    );
  }

  firstStepComplete(docCount) {
    this.percent = 100;
    setTimeout(() => {
      this.secondStep(docCount);
    }, 1000);
  }

  async firstStepError(error) {
    console.log(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: "Erreur",
      message: "Une erreur s'est produite lors de la connexion à la base de données.",
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    })
    await alert.present();
  }

  secondStep(docCount) {
    this.step = 2;
    this.description = "Téléchargement des documents...";
    this.percent = 0;
    this.completion = '0/' + docCount;

    const subject = new Subject<any>();
    this.remoteDB.replicate.to(this.localDB, { live: false, retry: true })
    .on('change', (result) => {
      console.log("2 - En COURS");
      subject.next({ repCount: Math.min(result.docs_written, docCount), docCount: docCount });
    })
    .on('complete', () => {
      console.log("2 - COMPLETE")
      subject.complete();
    })
    .on('error', (error) => {
      console.log(error);
      subject.error(error);
    });

    subject.subscribe({
      next: (state) => { this.secondStepProgress(state.repCount, state.docCount) },
      complete: () => { this.secondStepComplete() },
      error: (error) => { this.secondStepError(error) }
    })
  }

  secondStepProgress(repCount, docCount)  {
    this.percent =  repCount / docCount * 100;
    this.completion = repCount + '/' + docCount;
  }

  secondStepComplete() {
    setTimeout(() => {
      this.thirdStep();
    }, 1000)
  }

  async secondStepError(error) {
    console.log(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: "Erreur",
      message: "Une erreur s'est produite lors du téléchargement des documents.",
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    })
    await alert.present();
  }

  thirdStep() {
    this.step = 3;
    this.description = "Préparation de l'espace de travail...";
    this.percent = 0;
    this.completion = '0/' + designDocs.length;

    let promises = [];

    for (let i = 0, element; element = designDocs[i]; i++) {
      let promise = this.localDB.put(element).then(
        () => {
          console.log("3 - EN COURS");
          this.thirdStepProgess(i + 1);
        },
        (error) => {
          console.log("SECOND CASE" + error);
          if (error.status === 409) { // already done
            this.thirdStepProgess(i + 1);
            console.log("3 - COMPLETE");
          } else {
            this.thirdStepError(error);
          }
      });
      promises.push(promise);
    }

    Promise.all(promises)
    .then(
      () => {
        this.thirdStepComplete();
      },
      (error) => {
        console.log("Faut check les views already in local db");
        console.log(error);
        this.thirdStepError(error);
      }
    )
  }

  thirdStepProgess(proceedDocs) {
    this.percent = (proceedDocs / designDocs.length) * 100;
    console.log("THIRD PROGRESS : " + proceedDocs);
    this.completion = proceedDocs + '/' + designDocs.length;
  }

  thirdStepComplete() {
    console.log("3 - REAL COMPLETE");
    setTimeout(() => {
      this.fourthStep()
    }, 1000);
  }

  async thirdStepError(error) {
    console.log(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: "Erreur",
      message: "Une erreur s'est produite lors de la préparation de l'espace de travail.",
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    })
    await alert.present();
  }

  fourthStep() {
    console.log("FOURTH STEP");
    this.step = 4;
    this.description = "Contruction des index...";
    this.percent = 0;
    this.completion = '0/' + indexedViews.length;

    let promises = [];
    let proceedViews = 0;

    for (let i = 0, view; view = indexedViews[i]; i++) {
      let promise = this.localDB.query(view, { limit: 0 }).then(
        () => {
          this.fourthStepProgress(++proceedViews);
        },
        (error) => {
          this.fourthStepError(error);
        }
      );
      promises.push(promise);
    }

    Promise.all(promises)
    .then(
      () => {
        this.fourthStepComplete();
      },
      (error) => {
        this.fourthStepError(error);
      }
    )
  }

  fourthStepProgress(proceedViews) {
    this.percent = (proceedViews / indexedViews.length) * 100;
    console.log("FOURTH PROGRESS : " + proceedViews);
    this.completion = proceedViews + '/' + indexedViews.length;
  }

  fourthStepComplete() {
    setTimeout(() => {
      this.fifthStep();
    }, 1000);
  }

  async fourthStepError(error) {
    console.log(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: "Erreur",
      message: "Une erreur s'est produite lors de la construction des index.",
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    })
    await alert.present();
  }

  fifthStep() {
    this.step = 5;
    this.description = "Synchronisation avec la base de données distantes...";
    this.percent = 0;
    this.completion = '0/1';

    const options = { live: false, retry: false };
    this.localDB.sync(this.remoteDB, options)
    .on('complete', () => {
      this.completion = "1/1";
      this.percent = 100;
      this.fifthStepComplete();
    })
    .on('error', (error) => {
      this.fifthStepError(error);
    })
  }

  fifthStepComplete() {
    this.databases[this.databaseIndex].replicated = true;
    this.dbService.updateDatabasesHardDisk(this.databases);

    console.log("FINIIIIIIIIIII");
    this.statusChange.emit(4);
  }

  async fifthStepError(error) {
    console.log(error);
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: "Erreur",
      message: "Une erreur s'est produite lors de la synchronisation",
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.backToDatabase();
            return;
          }
        }
      ]
    })
    await alert.present();
  }

  backToDatabase() {
    this.statusChange.emit(0);
  }

}
