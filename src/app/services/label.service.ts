import { Injectable, OnInit } from '@angular/core';
import { DatabaseService } from './database.service';
import { DatabaseModel } from '../components/database-connection/models/database.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService implements OnInit {

  showTextConfig: string;

  constructor(private databaseService: DatabaseService) {
    this.showTextConfig = null;
  }

  ngOnInit() {
    this.databaseService.getCurrentDatabaseSettings()
      .then((config: DatabaseModel) => {
        this.showTextConfig = config.context.showText;
      });
  }

  doc2String(doc) {
    const id = doc._id || doc.id;

    if (this.showTextConfig === "fullName") {
      return doc.libelle ? doc.libelle : "id: " + id;
    } else if (this.showTextConfig === "abstract") {
      return doc.abrege ? doc.abrege : doc.designation + ' : ' + doc.libelle
    } else if (this.showTextConfig === "both") {
      return doc.abrege ? doc.abrege + ' : ' + doc.libelle : doc.designation + ' : ' + doc.libelle
    } else {
      return doc.abrege ? doc.abrege + ' : ' + doc.libelle : doc.designation + ' : ' + doc.libelle
    }
  }
}
