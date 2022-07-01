import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { DatabaseService } from '../../../services/database.service';
import { SirsDataService } from '../../../services/sirs-data.service';

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
              private loadingCtrl: LoadingController) { }

  ngOnInit() {}

  onBack() {
    this.statusChange.emit(0);
  }

  authenticate() {
    this.authService.login(this.auth.username, this.auth.password)
    .then(
      async () => {
        const database = await this.dbService.getDatabaseSettings();
        if (database && database[0].replicated) {
          const loading = await this.loadingCtrl.create({
            message: 'Déploiement en cours ...'
          });
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
