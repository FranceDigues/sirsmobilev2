import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseModel } from 'src/app/models/database.model';
import { AlertController } from '@ionic/angular';
import { async } from '@angular/core/testing';
import { EditDatabaseComponent } from '../edit-database/edit-database.component';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-database-choice',
  templateUrl: './database-choice.component.html',
  styleUrls: ['./database-choice.component.scss', '../database-connection.page.scss'],
})
export class DatabaseChoiceComponent implements OnInit {

  databases: Array<DatabaseModel> = [];
  selectedDatabase: any;

  constructor(private router: Router, private nativeStorage: NativeStorage,
    private alertCtrl: AlertController, private dbService: DatabaseService) {}

  ngOnInit(): void {
    console.log("houhou");
    this.nativeStorage.getItem('databases')
    .then(
      (data) => {
        console.log(data);
        this.databases = data;
      },
      (error) => {
        console.log('There is no database in hard disk', error);
      }
    )
  }

  addDatabase() {
    this.router.navigateByUrl('/database-connection/add-database');
  }

  editDatabase() {
    let id = 0;
    for (let i = 0; i < this.databases.length; i++) {
      if (this.databases[i] === this.selectedDatabase) {
        id = i;
      }
    }
    this.router.navigate(['/database-connection/edit-database', id]);
  }

  async removeDatabase() {
    if (!this.selectedDatabase) {
      return;
    }
    const alert = await this.alertCtrl.create({
      header: "Suppression d'une base de données",
      message: "Voulez-vous vraiment supprimer cette base de données",
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: () => {
            for (let i = 0; i < this.databases.length; i++) {
              if (this.databases[i] === this.selectedDatabase) {
                this.databases.splice(i, 1);
                this.nativeStorage.setItem('databases', this.databases);
                this.selectedDatabase = null;
                return;
              }
            }
          }
        }
      ]
    })
    await alert.present();
  }

  selectDB(db) {
    this.selectedDatabase = db;
  }

}
