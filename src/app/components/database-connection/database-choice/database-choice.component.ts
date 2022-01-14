import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { DatabaseModel } from 'src/app/components/database-connection/models/database.model';
import { AuthService } from '../../../services/auth.service';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-database-choice',
  templateUrl: './database-choice.component.html',
  styleUrls: ['./database-choice.component.scss', '../database-connection.page.scss'],
})
export class DatabaseChoiceComponent implements OnInit {

  databases: Array<DatabaseModel>;
  selectedDatabase: DatabaseModel;
  status = 0;
  databaseIndex = 0;

  constructor(private router: Router, private platform: Platform,
              public alertCtrl: AlertController, private dbService: DatabaseService,
              private authService: AuthService, private splashScreen: SplashScreen,
              private statusBar: StatusBar) {
                this.init();
              }

  ngOnInit() {
  }

  init() {
    this.platform.ready()
    .then(
      () => {
        this.dbService.getDatabaseSettings()
        .then(
          (databases) => {
            this.databases = databases;
            setTimeout(() => {
              this.statusBar.styleBlackTranslucent();
              this.splashScreen.hide();
            }, 500);
          },
          (error) => {
            this.statusBar.styleBlackTranslucent();
            this.splashScreen.hide();
            console.error('no \'databases\' in HardDisk ' + error);
          }
        );
      }
    );
  }

  changeStatus(status: number) {
    this.status = status;
    this.dbService.getDatabaseSettings()
    .then(
      (databases) => {
        this.databases = databases;
      },
      (error) => {
        console.error('no \'databases\' in HardDisk ' + error);
      }
    );
  }

  selectDB(db) {
    if (db !== this.selectedDatabase) {
      this.dbService.changeDatabase();
    }
    this.selectedDatabase = db;
    this.dbService.setActiveDB(this.selectedDatabase);
    for (let i = 0; i < this.databases.length; i++) {
      if (this.databases[i] === this.selectedDatabase) {
        this.databaseIndex = i;
        return;
      }
    }
  }

  addDatabase() {
    this.status = 1;
  }

  editDatabase() {
    this.status = 2;
  }

  async removeDatabase() {
    if (!this.selectedDatabase) {
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Suppression d\'une base de données',
      message: 'Voulez-vous vraiment supprimer cette base de données',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: () => {
            this.databases.splice(this.databaseIndex, 1);
            this.dbService.saveDatabaseSettings(this.databases);
            this.selectedDatabase = null;
            return;
          }
        }
      ]
    });
    await alert.present();
  }

  validateDatabase() {
    if (this.selectedDatabase.replicated === false) {
      this.status = 3;
    } else if (this.selectedDatabase.replicated
        && (this.selectedDatabase.context.authUser === undefined || !this.selectedDatabase.context.authUser)) {
      this.status = 4;
    } else {
      this.authService.user = this.dbService.activeDB.context.authUser;
      this.router.navigateByUrl('/main').then();
    }
  }

}
