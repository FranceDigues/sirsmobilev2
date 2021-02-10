import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';

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

  constructor(private authService: AuthService, private alrtCtrl: AlertController) { }

  ngOnInit() {}

  onBack() {
    this.statusChange.emit(0);
  }

  authenticate() {
    this.authService.login(this.auth.username, this.auth.password)
    .then(
      () => {
        this.status = 2;
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
