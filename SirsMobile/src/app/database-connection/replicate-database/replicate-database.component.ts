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
      this.step = 0;
      this.description = "Loading...";
      this.percent = 0;
      this.completion = null;
    }

  async ngOnInit() {
    this.databaseIndex = parseInt(this.route.snapshot.paramMap.get('id'));
    this.databases = await this.dbService.getDatabasesHardDisk();
    this.activeDb = this.databases[this.databaseIndex];
    this.localDB = await this.dbService.getLocalDB(this.activeDb);
    this.remoteDB = await this.dbService.getRemoteDB(this.activeDb);
    this.localDB.info( // faire une demande à Hilmi pour changer ça
      () => {
        console.log("it begins")
        this.firstStep();
      },
      (error) => {
        console.log("Error " + error);
      }
    )
  }

  firstStep() {
    this.step = 1;
    this.description = "Connexion à la base de données...";
    this.percent = 0;
    this.completion = null;
    // insomnia start
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

    for (let i = 0, element; element = designDocs[i]; i++) {
      const subject = new Subject<any>();
      this.localDB.put(element).then(
        () => {
          console.log("3 - EN COURS");
          // this.thirdStepProgess(i + 1);
          subject.next(i + 1);
          subject.complete();
        },
        (error) => {
          console.log("SECOND CASE" + error);
          // this.thirdStepProgess(i + 1);
          subject.next(i + 1);
          if (error.status === 409) { // already done
            console.log("3 - COMPLETE");
            subject.complete();
            // this.thirdStepComplete();
          } else {
            // this.thirdStepError(error);
            subject.error(error);
          }
      });
      subjects.push(subject);
    }

    forkJoin(subjects).subscribe({
      next: (i) => { this.thirdStepProgess(i) },
      complete: () => { this.thirdStepComplete() },
      error: (error) => { this.thirdStepError(error) }
    });
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

    let subjects = [];

    for (let i = 0, view; view = indexedViews[i]; i++) {
      console.log("FOURTH");
      console.log(i);
      const subject = new Subject<any>();
      this.localDB.query(view, { limit: 0 }).then(
        () => {
          subject.next(i + 1);
          // this.fourthStepProgress(i + 1);
          subject.complete();
        },
        (error) => {
          subject.next(i + 1);
          // this.fourthStepProgress(i + 1);
          subject.error(error);
        }
      );
      subjects.push(subject);
    }

    forkJoin(subjects).subscribe({
      next: (i) => { this.fourthStepProgress(i) },
      complete: () => { this.fourthStepComplete() },
      error: (error) => { this.fourthStepError(error) }
    });
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
    this.completion = '0/' + syncViews.length;

    let subjects = [];

    for (let i = 0, view; view = syncViews[i]; i++) {
      const subject = new Subject<any>();
      const options = { live: false, retry: false, filter: '_view', view: view };
      this.localDB.sync(this.remoteDB, options)
      .on('complete', () => {
        subject.next(i + 1);
        // this.fifthStepProgress(i + 1);
          subject.complete();
        })
      .on('error', (error) => {
        subject.next(i + 1);
        // this.fifthStepProgress(i + 1);
          subject.error(error);
      });
      subjects.push(subject);
    }

    forkJoin(subjects).subscribe({
      next: (i) => { this.fifthStepProgress(i) },
      complete: () => { this.fifthStepComplete() },
      error: (error) => { this.fifthStepError(error) }
    })

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

    console.log("FINIIIIIIIIIII");
    this.router.navigateByUrl('/login');

    //update databases in hardisk;
  }

  async fifthStepError(error) {
    console.log(error);
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
