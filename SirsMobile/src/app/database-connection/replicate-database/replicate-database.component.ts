import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { defer, forkJoin, Subject } from 'rxjs';
import { DatabaseService } from './../../database.service';
import { DatabaseModel } from 'src/app/models/database.model';
import { designDocs, indexedViews, syncViews } from './couchDB-Vues';
import { AlertController } from '@ionic/angular';
// import { Defer } from './defer';

@Component({
  selector: 'app-replicate-database',
  templateUrl: './replicate-database.component.html',
  styleUrls: ['./replicate-database.component.scss'],
})
export class ReplicateDatabaseComponent implements OnInit {

  databaseIndex = 0;
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
    private alertCtrl: AlertController) {
    }

  async ngOnInit() {
    this.databaseIndex = parseInt(this.route.snapshot.paramMap.get('id'));
    this.databases = await this.dbService.getDatabasesHardDisk();
    this.activeDb = this.databases[this.databaseIndex];
    // .then(
    //   (data) => {
    //     console.log(data);
    //     this.databases = data;
    //     // console.log(this.databases);
        console.log("0");
        console.log(this.activeDb);
        console.log("name");
        console.log(this.activeDb.name);
        console.log("0.5");
        this.localDB = await this.dbService.getLocalDB(this.activeDb);
        console.log("33333");
        this.remoteDB = await this.dbService.getRemoteDB(this.activeDb);
        console.log("julllll");
        console.log("localDB");
        console.log(this.localDB);
        console.log("remoteDB");
        console.log(this.remoteDB);
        this.localDB.info()
        .then(
          (info) => {
            console.log("info");
            console.log(info);
            this.firstStep();
          }
        )
  }

  firstStep() {
    this.step = 1;
    this.description = "Connexion à la base de données...";
    this.percent = 0;
    this.completion = null;
    console.log("1");
    // insomnia start
    this.remoteDB.info()
    .then(
      (result) => {
        console.log("lol");
        console.log(result);
        this.firstStepFinish(result.doc_count);
      },
      (err) => {
        console.log("Error FirstStepError");
        console.log(err);
        this.firstStepError();
      }
    );
  }

  firstStepFinish(docCount) {
    this.percent = 100;
    setTimeout(() => {
      this.secondStep(docCount);
    }, 1000);
  }

  async firstStepError() {
    // faire une popup
    const alert = await this.alertCtrl.create({
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
      subject.next({ repCount: Math.min(result.docs_written, docCount), docCount: docCount });
    })
    .on('complete', () => {
      subject.complete();
    })
    .on('error', (error) => {
      console.log(error);
      subject.error(error);
    });

    subject.subscribe({
      next: () => this.secondStepProgress,
      complete: () => this.secondStepFinish,
      error: () => this.secondStepError
    })
  }

  secondStepProgress(state) {
    this.percent = (state.repCount / state.docCount) * 100;
    this.completion = state.repCount + '/' + state.docCount;
  }

  secondStepFinish() {
    setTimeout(() => {
      this.thirdStep();
    }, 1000)
  }

  async secondStepError(error) {
    // faire une popup error downloading
    const alert = await this.alertCtrl.create({
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

    let subjects = [];

    designDocs.forEach((element, i) => {
      const subject = new Subject<any>();
      this.localDB.put(element).then(
        () => {
          subject.next(i + 1);
          subject.complete();
        },
        (error) => {
          subject.next(i + 1);
          if (error.status === 409) { // already done
            subject.complete();
          } else {
            subject.error(error);
          }
      });
      subjects.push(subject);
    });

    return (forkJoin(subjects));
  }

  thirdStepProgess(proceedDocs) {
    this.percent = (proceedDocs / designDocs.length) * 100;
    this.completion = proceedDocs + '/' + designDocs.length;
  }

  thirdStepComplete() {
    setTimeout(() => {
      this.fourthStep();
    }, 1000);
  }

  async thirdStepError() {
    // faire une popup error on work loading
    const alert = await this.alertCtrl.create({
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
    this.step = 4;
    this.description = "Contruction des index...";
    this.percent = 0;
    this.completion = '0/' + indexedViews.length;

    let subjects = [];

    indexedViews.forEach((view, i) => {
      const subject = new Subject<any>();
      this.localDB.query(view, { limit: 0 }).then(
        () => {
          subject.next(i + 1);
          subject.complete();
        },
        (error) => {
          subject.next(i + 1);
          if (error.status === 409) { // already done
            subject.complete();
          } else {
            subject.error(error);
          }
      });
      subjects.push(subject);
    });

    return (forkJoin(subjects));

    // const subject = new Subject<any>();
    // indexedViews.forEach((view, i) => {
    //   new Promise(() => {
    //     this.localDB.query(view, { limit: 0 }).then(
    //       () => {
    //         subject.next(i + 1);
    //         subject.complete();
    //       },
    //       (error) => {
    //         subject.next(i + 1);
    //         if (error.status === 409) {
    //           subject.complete();
    //         } else {
    //           subject.error(error);
    //         }
    //       }
    //     );
    //     // return
    //   });
    // });

    // subject.subscribe({
    //   next: this.fourthStepProgress,
    //   complete: this.fourthStepComplete,
    //   error: this.fourthStepError
    // })
  }

  fourthStepProgress(proceedViews) {
    this.percent = (proceedViews / indexedViews.length) * 100;
    this.completion = proceedViews + '/' + indexedViews.length;
  }

  fourthStepComplete() {
    setTimeout(() => {
      this.fifthStep();
    }, 1000);
  }

  async fourthStepError() {
    // faire une popup error creating indexes
    const alert = await this.alertCtrl.create({
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
    this.completion = '0/' + 0;

    let subjects = [];

    designDocs.forEach((view, i) => {
      const subject = new Subject<any>();
      const options = { live: false, retry: false, filter: '_view', view: view };
      this.localDB.sync(view, options)
      .on('complete', () => {
          subject.next(i + 1);
          subject.complete();
        })
      .on('error', (error) => {
          subject.next(i + 1);
            subject.error(error);
      });
      subjects.push(subject);
    });

    return (forkJoin(subjects));

    // const subject = new Subject<any>();
    // syncViews.forEach((view, i) => {
    //   new Promise(() => {
    //     const options = { live: false, retry: false, filter: '_view', view: view };
    //     this.localDB.sync(view, options)
    //     .on('complete', () => {
    //         subject.next(i + 1);
    //         subject.complete();
    //     })
    //     .on('error', (error) => {
    //       subject.next(i + 1);
    //       subject.error(error);
    //     });
    //     // return
    //   });
    // });

    // subject.subscribe({
    //   next: this.fifthStepProgress,
    //   complete: this.fifthStepComplete,
    //   error: this.fifthStepError
    // })
  }

  fifthStepProgress(proceedViews) {
    this.percent = (proceedViews / syncViews.length) * 100;
    this.completion = proceedViews + '/' + syncViews.length;
  }

  fifthStepComplete() {
    this.databases[this.databaseIndex].replicated = true;
    // insomnia stop
    this.dbService.updateDatabasesHardDisk(this.databases);

    this.router.navigateByUrl('/login');

    //update databases in hardisk;
  }

  async fifthStepError(error) {
    // faire une popup error synchronisation
    const alert = await this.alertCtrl.create({
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
    this.router.navigateByUrl('/database-connection');
  }

}
