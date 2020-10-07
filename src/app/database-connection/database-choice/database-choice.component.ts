import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { DatabaseModel } from 'src/app/models/database.model';
import { AuthService } from '../../auth.service';
import { DatabaseService } from '../../database.service';

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
        this.dbService.getDatabasesHardDisk()
        .then(
          (databases) => {
            this.databases = databases;
            setTimeout(() => {
              this.statusBar.styleDefault();
              this.splashScreen.hide();
            }, 500);
          },
          (error) => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            console.log('no \'databases\' in HardDisk ' + error);
          }
        );
      }
    );
  }

  changeStatus(status: number) {
    this.status = status;
    this.dbService.getDatabasesHardDisk()
    .then(
      (databases) => {
        this.databases = databases;
      },
      (error) => {
        console.log('no \'databases\' in HardDisk ' + error);
      }
    );
  }

  selectDB(db) {
    if (db !== this.selectedDatabase) {
      this.dbService.changeDatabase();
    }
    this.selectedDatabase = db;
    this.dbService.setActiveDB(this.selectedDatabase);
    console.log('ACTIVE DB', this.dbService.activeDB);
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
            this.dbService.updateDatabasesHardDisk(this.databases);
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
    } else if (this.selectedDatabase.replicated && (this.selectedDatabase.context.authUser === undefined || !this.selectedDatabase.context.authUser)) {
      this.status = 4;
    } else {
      this.authService.user = this.dbService.activeDB.context.authUser;
      this.router.navigateByUrl('/main');
    }
  }

}
