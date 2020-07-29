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
  status = 0;
  databaseIndex = 0;

  constructor(private router: Router,
    private alertCtrl: AlertController, private dbService: DatabaseService) {}

  ngOnInit() {
    this.dbService.getDatabasesHardDisk()
    .then(
      (databases) => {
        this.databases = databases;
      }
    )
  }

  changeStatus(status: number) {
    this.status = status;
    this.dbService.getDatabasesHardDisk()
    .then(
      (databases) => {
        this.databases = databases;
      }
    )
  }

  selectDB(db) {
    console.log(db);
    if (db != this.selectedDatabase) {
      this.dbService.changeDatabase();
    }
    this.selectedDatabase = db;
    for (let i = 0; i < this.databases.length; i++) {
      if (this.databases[i] === this.selectedDatabase) {
        this.databaseIndex = i;
        console.log("index : " + this.databaseIndex);
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
      header: "Suppression d'une base de données",
      message: "Voulez-vous vraiment supprimer cette base de données",
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
    })
    await alert.present();
  }

  validateDatabase() {
    if (this.selectedDatabase.replicated == false) {
      this.status = 3;
    } else {
      console.log("GO TO LOGIN BCS DB ALREADY REPLICATED");
    }
  }

}
