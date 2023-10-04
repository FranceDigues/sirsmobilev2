// @ts-nocheck

import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import WKT from 'ol/format/WKT';
import { DatabaseService } from 'src/app/services/database.service';
import { EditObjectService } from "../../../../services/edit-object.service";
import Point from "ol/geom/Point";

@Component({
  selector: 'app-positionbyborne-modal-photo',
  templateUrl: './positionbyborne-modal-photo.component.html',
  styleUrls: ['./positionbyborne-modal-photo.component.scss'],
})
export class PositionbyborneModalPhotoComponent implements OnInit {

  @Input() data;

  wktFormat = new WKT();
  troncon = null;
  systemeReperage = null;
  systemeReperageList = null;
  systemeReperageId = null;

  constructor(private modalCtrl: ModalController,
              private db: DatabaseService, private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              public EOS: EditObjectService) {
                this.init();
              }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss(null);
  }

  selectSR() {
    this.data.systemeRepId = this.systemeReperageId;
    this.systemeReperage = this.systemeReperageList.find(item => item.id === this.data.systemeRepId);
    this.completeSystemeReperageBornes().then();
  }

  completeSystemeReperageBornes() {
    return new Promise(resolve => {
      const borneIds = this.systemeReperage.value.systemeReperageBornes.map(item => item.borneId);
      this.db.getLocalDB().query('getBornesIdsHB', { keys: borneIds })
        .then((res) => {
          this.systemeReperage.value.systemeReperageBornes.forEach((item1) => {
            res.rows.forEach((item2) => {
              if (item1.borneId === item2.id) {
                  item1.libelle = item2.value.libelle;
                  item1.borneGeometry = item2.value.geometry;
              }
            });
          });
          resolve();
        });
    })
  }

  updateBorneLibelle() {
    const libelle = this.systemeReperage.value.systemeReperageBornes.find(item => item.borneId === this.data.borneId).libelle;
    this.data.borneLibelle = libelle;
  }

  private canValidate() {
      return this.data.systemeRepId
        && this.data.borneId
        && this.data.borne_aval
        && this.data.borne_distance > -1;
  }

  validate() {
    if (this.canValidate()) {
      this.data.approximatePosition = this.EOS.calculateApproximatePosition(this.data.borneId,
          this.data.borne_aval,
          this.data.borne_distance,
          this.systemeReperage.value.systemeReperageBornes,
          this.troncon.geometry);
      this.modalCtrl.dismiss(this.data);
    } else {
      this.alertCtrl.create({
          header: 'Validation',
          message: 'Veuillez renseigner tous les champs obligatoires avant de valider',
          buttons: [{ text: 'Ok', role: 'cancel' }]
        })
        .then(alert => alert.present());
    }
  }

  init() {
      this.troncon = this.EOS.troncons.find((item) => {
          return item.id === this.EOS.objectDoc.linearId;
      });
    this.loadingCtrl.create({ message: 'Chargement' })
    .then(
      (loading: HTMLIonLoadingElement) => {
        loading.present();
        if (this.data.parentSystemeRepId) {
          this.db.getLocalDB().query('byId', { key: this.data.parentSystemeRepId })
            .then((results) => {
              this.systemeReperageList = results.rows;
              if (this.data.systemeRepId) {
                this.systemeReperageId = this.data.systemeRepId;
                this.systemeReperage = this.systemeReperageList.find(item => item.id === this.data.systemeRepId);
                if (!this.systemeReperage) {
                  loading.dismiss();
                  return;
                }
                this.completeSystemeReperageBornes().then(() => loading.dismiss());
              }
              if (!this.data.systemeRepId) {
                this.systemeReperageId = null;
                loading.dismiss();
              }
            });
        } else {
          loading.dismiss();
          throw new Error("Unexpected behavior: input data should contain parentSystemRepId parameter");
        }
      }
    );
  }
}
