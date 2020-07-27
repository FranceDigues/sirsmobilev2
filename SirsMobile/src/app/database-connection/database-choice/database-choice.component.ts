import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseModel } from 'src/app/models/database.model';
import { AlertController } from '@ionic/angular';
import { EditDatabaseComponent } from '../edit-database/edit-database.component';
import { DatabaseService } from '../../database.service';
@Component({
  selector: 'app-database-choice',
  templateUrl: './database-choice.component.html',
  styleUrls: ['./database-choice.component.scss', '../database-connection.page.scss'],
})
export class DatabaseChoiceComponent implements OnInit {

  databases: Array<DatabaseModel>;
  selectedDatabase: DatabaseModel;
  databaseIndex = 0;

  constructor(private router: Router, private nativeStorage: NativeStorage,
    private alertCtrl: AlertController, private dbService: DatabaseService) {}

  ngOnInit() {
    console.log("houhou");
    // this.databases = await this.dbService.getDatabasesHardDisk();
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

  selectDB(db) {
    console.log("arr");
    console.log(this.databases);
    if (db != this.selectedDatabase) {
      console.log("CHANGEMENT DE DATABASE");
      this.dbService.changeDatabase();
    }
    this.selectedDatabase = db;
    for (let i = 0; i < this.databases.length; i++) {
      if (this.databases[i] === this.selectedDatabase) {
        this.databaseIndex = i;
        console.log("index");
        console.log(this.databaseIndex);
        return;
      }
    }
  }

  addDatabase() {
    this.router.navigateByUrl('/database-connection/add-database');
  }

  editDatabase() {
    this.router.navigate(['/database-connection/edit-database', this.databaseIndex]);
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
            this.databases.slice(this.databaseIndex, 1);
            this.dbService.updateDatabasesHardDisk(this.databases);
            // this.nativeStorage.setItem('databases', this.databases);
            this.selectedDatabase = null;
            return;
          }
        }
      ]
    })
    await alert.present();
  }

  validateDatabase() {
    if (this.selectedDatabase.replicated == false) {
      this.router.navigate(['/database-connection/replicate-database', this.databaseIndex]);
    } else {
      this.router.navigateByUrl('/login');
    }
  }

}
