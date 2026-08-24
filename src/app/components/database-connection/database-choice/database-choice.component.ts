import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { DatabaseModel } from 'src/app/components/database-connection/models/database.model';
import { AuthService } from '../../../services/auth.service';
import { DatabaseService } from '../../../services/database.service';
import { SirsDataService } from '../../../services/sirs-data.service';
import { designDocs } from '../replicate-database/couchDB-Vues';
import { EditionModeService } from "../../../services/edition-mode.service";
import {clear as clearMemoize} from "typescript-memoize";
import {StorageService} from "@ionic-lib/lib-storage/storage.service";
import {AppTronconsService} from "../../../services/troncon.service";

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
    slowReplication : boolean = false;
    @ViewChild('replicationModal') replicationModal: TemplateRef<any>;
    constructor(private router: Router,
                private platform: Platform,
                public alertCtrl: AlertController,
                private dbService: DatabaseService,
                private authService: AuthService,
                private splashScreen: SplashScreen,
                private statusBar: StatusBar,
                private sirsDataService: SirsDataService,
                private editionModeService: EditionModeService,
                private loadingCtrl: LoadingController,
                private storageService: StorageService,
                private appTronconsService: AppTronconsService) {
        this.init();
    }

    ngOnInit() {
        this.dbService.changeDefaultPrestationId('');
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
        this.slowReplication = false;
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
                    handler: async () => {
                        const localDB = await this.dbService.getLocalDB();

                        localDB.destroy().then(() => {
                            this.databases.splice(this.databaseIndex, 1);
                            this.dbService.saveDatabaseSettings(this.databases);
                            this.selectedDatabase = null;
                            this.dbService.removeDB$.next("DB deleted");
                        }).catch(err => console.error(err));
                    }
                }
            ]
        });
        await alert.present();
    }

    async validateDatabase() {
        if (this.selectedDatabase.replicated === false) {
            this.status = 3;
        } else if (this.selectedDatabase.replicated
            && (this.selectedDatabase.context.authUser === undefined || !this.selectedDatabase.context.authUser)) {
                        // Vérifier s'il existe une autre BD avec un authUser défini
            const hasAuthUserInOtherDB = this.databases.some(
                    (db) => db !== this.selectedDatabase && db.context.authUser !== undefined && db.context.authUser
            );
            if (!hasAuthUserInOtherDB) {
                    this.status = 4;
                    return;
            } else { // already connected
                    this.status = 5;
                    return;
            }
        } else {
            const loading = await this.loadingCtrl.create({
                message: 'Déploiement en cours ...'
            });
            await loading.present();
            await this.sirsDataService.loadDataFromDB();
            this.authService.user = this.dbService.activeDB.context.authUser;
            await this.updateViews();
            await this.router.navigateByUrl('/main');
            await loading.dismiss();
        }
    }

    async replicateSlowDatabase(){
        this.slowReplication = true;
        this.status = 3;
    }

    public async updateViews(): Promise<void> {
        for (const designDoc of designDocs) {
            try {
                await this.dbService.localDB.put(designDoc);
            } catch (error) {
                if (error.status !== 409) console.warn(error);
            }
        }
    }

    openReplicationModal() {
        const modalRef = this.alertCtrl.create({
            header: 'Réplication plus lente',
            message: `
            <p>En activant cette option, la réplication sera plus lente afin de palier le cas d'une réplication classique n'arrivant pas à terme</p>
            <mat-checkbox [(ngModel)]="slowReplication">Activer la réplication lente</mat-checkbox>
        `,
            buttons: [
                {
                    text: 'Fermer',
                    role: 'cancel',
                },
                {
                    text: 'Confirmer',
                    handler: () => {
                        this.confirmSlowReplication();
                    },
                },
            ],
        });
        modalRef.then((modal) => modal.present());
    }


    confirmSlowReplication() {
        this.slowReplication = true;
        this.status = 3;
        this.closeModal();
    }

    closeModal() {
        this.alertCtrl.dismiss();
    }
    async closeDatabase() {
        const realActiveBase = this.dbService.activeDB;
        const databaseWithAuthUser = this.databases.find(
         (db) => db !== this.selectedDatabase && db.context.authUser !== undefined && db.context.authUser
        );

        databaseWithAuthUser.context.authUser = null;
        this.dbService.activeDB = databaseWithAuthUser;
        this.dbService.removeDB$.next("DB changed");
        await this.dbService.setCurrentDatabaseSettings(databaseWithAuthUser);
        this.dbService.activeDB = realActiveBase;
        this.cleanAllFavoriteTroncon();
        this.status = 4;

    }
   cancelAction() {
       this.status = 0;
       console.log('Action annulée par l’utilisateur.');
    }
    cleanAllFavoriteTroncon() {
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

    }
}
