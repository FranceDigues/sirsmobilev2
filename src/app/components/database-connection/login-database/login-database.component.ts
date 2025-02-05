import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { DatabaseService } from '../../../services/database.service';
import { SirsDataService } from '../../../services/sirs-data.service';
import {clear as clearMemoize} from "typescript-memoize";
import {StorageService} from "@ionic-lib/lib-storage/storage.service";
import {AppTronconsService, SystemeEndiguement} from "../../../services/troncon.service";

@Component({
  selector: 'app-login-database',
  templateUrl: './login-database.component.html',
  styleUrls: ['./login-database.component.scss', '../database-connection.page.scss'],
})
export class LoginDatabaseComponent implements OnInit {

  @Output() readonly statusChange = new EventEmitter<any>();

  status = 0;

  auth = {
    username: '',
    password: ''
  };

  constructor(private authService: AuthService,
              private alrtCtrl: AlertController,
              private router: Router,
              private sirsDataService: SirsDataService,
              private dbService: DatabaseService,
              private loadingCtrl: LoadingController,
              private storageService: StorageService,
              private appTronconsService: AppTronconsService,
              private SE:SystemeEndiguement) { }

  ngOnInit() {}

  onBack() {
    this.statusChange.emit(0);
  }

  authenticate() {
    this.authService.login(this.auth.username, this.auth.password)
    .then(
      async () => {
        const database = await this.dbService.getDatabaseSettings();
        const realActiveBase = this.dbService.activeDB;
        for (const db of database) {
          if (db.context && db.context.authUser) {
            db.context.authUser = null;
            this.dbService.activeDB = db;
            this.dbService.removeDB$.next("DB changed");
            await this.dbService.setCurrentDatabaseSettings(db);
          }
        };
        this.dbService.activeDB = realActiveBase;
        if (this.dbService.activeDB.replicated) {
          this.storageService.getItem('AppTronconsFavorities')
              .then( (res: Array<any>) => {
                if (res !== null) {
                  console.log("troncons choisies:: ", res)
                }
              });

          this.appTronconsService.favorites = [];
          this.storageService.setItem('AppTronconsFavorities', this.appTronconsService.favorites)
              .then(() => {
                console.log("Favorites cleaned and storage updated");
              });
          clearMemoize(['isTronconActive']);
          const loading = await this.loadingCtrl.create({
            message: 'Déploiement en cours ...'
          });
          await this.SE.reloadSE();
          await loading.present();
          await this.sirsDataService.loadDataFromDB();
          this.authService.user = this.dbService.activeDB.context.authUser;
          await this.router.navigateByUrl('/main');
          await loading.dismiss();
        } else {
          this.status = 2;
        }
      },
      async (error) => {
        console.error('Login ERROR : ' + error);
        const alert = await this.alrtCtrl.create({
          header: 'Erreur',
          message: 'Impossible de d\'authentifier. Veuillez vérifier vos informations de connexion.',
          buttons: [
            {
              text: 'Ok',
              role: 'cancel'
            }
          ]
        });
        await alert.present();
      }
    );
  }

}
