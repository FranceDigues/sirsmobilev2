// @ts-nocheck

import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { EditObjectService } from '../../../services/edit-object.service';
import WKT from 'ol/format/WKT';
import { DatabaseService } from '../../../services/database.service';
import Point from "ol/geom/Point";

@Component({
  selector: 'app-positionbyborne-modal',
  templateUrl: './positionbyborne-modal.component.html',
  styleUrls: ['./positionbyborne-modal.component.scss'],
})
export class PositionByBorneModalComponent implements OnInit {

  @Input() data;

  wktFormat = new WKT();
  troncon = null;
  systemeReperage = null;
  systemeReperageList = null;
  systemeReperageId = null;
  borneId = null;
  borneDebutId = null;
  borneFinId = null;
  endSR = null;

  constructor(public EOS: EditObjectService, private modalCtrl: ModalController,
              private db: DatabaseService, private loadingCtrl: LoadingController,
              private alertCtrl: AlertController) {
                this.init();
              }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss(null);
  }

  selectSR() {
    this.data.systemeRepId = this.systemeReperageId;
    this.systemeReperage = this.systemeReperageList.filter(
      (item) => {
        return item.id === this.data.systemeRepId;
    })[0];

    this.db.getLocalDB().query('getBornesIdsHB', {
      keys: this.systemeReperage.value.systemeReperageBornes
          .map((item) => {
              return item.borneId;
          })
    }).then(
      (res) => {
      this.systemeReperage.value.systemeReperageBornes.forEach((item1) => {
        res.rows.forEach((item2) => {
          if (item1.borneId === item2.id) {
              item1.libelle = item2.value.libelle;
              item1.borneGeometry = item2.value.geometry;
          }
        });
      });
    });
  }

  updateBorneLibelle() {
    if (!this.EOS.isLinear) {

      const index = this.systemeReperage.value.systemeReperageBornes.findIndex(
        (item) => {
          return item.borneId === this.data.borneDebutId;
      });

      const srb = this.systemeReperage.value.systemeReperageBornes[index];

      this.data.borneDebutLibelle = srb.libelle;
    } else {
      if (this.borneDebutId) {
        const indexDebut = this.systemeReperage.value.systemeReperageBornes.findIndex(
          (item) => {
            return item.borneId === this.data.borneDebutId;
        });
        const srbDebut = this.systemeReperage.value.systemeReperageBornes[indexDebut];
        this.data.borneDebutLibelle = srbDebut.libelle;
      }
      if (this.borneFinId) {
        const indexFin = this.systemeReperage.value.systemeReperageBornes.findIndex(
          (item) => {
            return item.borneId === this.data.borneFinId;
        });
        const srbFin = this.systemeReperage.value.systemeReperageBornes[indexFin];
        this.data.borneFinLibelle = srbFin.libelle;
      }
    }
  }

  private canValidate() {
    if (!this.EOS.isLinear) {
      return this.data.systemeRepId
        && this.data.borneDebutId
        && this.data.borne_debut_aval
        && this.data.borne_debut_distance > -1;
    } else {
      return this.data.systemeRepId
        && this.data.borneDebutId
        && this.data.borneFinId
        && this.data.borne_debut_aval
        && this.data.borne_fin_aval
        && this.data.borne_debut_distance > -1
        && this.data.borne_fin_distance > -1;
    }
  }

  validate() {
    if (this.canValidate()) {
      if (!this.EOS.isLinear) {
        this.data.approximatePositionDebut = this.EOS.calculateApproximatePosition(this.data.borneDebutId,
            this.data.borne_debut_aval,
            this.data.borne_debut_distance,
            this.systemeReperage.value.systemeReperageBornes,
            this.troncon.geometry);
      } else {
        this.data.approximatePositionDebut = this.EOS.calculateApproximatePosition(this.data.borneDebutId,
            this.data.borne_debut_aval,
            this.data.borne_debut_distance,
            this.systemeReperage.value.systemeReperageBornes,
            this.troncon.geometry);
        this.data.approximatePositionFin = this.EOS.calculateApproximatePosition(this.data.borneFinId,
            this.data.borne_fin_aval,
            this.data.borne_fin_distance,
            this.systemeReperage.value.systemeReperageBornes,
            this.troncon.geometry);
      }
      this.EOS.handlePosByBorne(this.data);
      this.closeModal();
    } else {
      this.alertCtrl.create({
          header: 'Validation',
          message: 'Veuillez renseigner tous les champs obligatoires avant de valider',
          buttons: [
            {
              text: 'Ok',
              role: 'cancel'
            }
          ]
        }
      ).then(
        (alert) => {
          alert.present();
        }
      );
    }
  }

  // TODO fix bug when modal 2 times in a row
  init() {
    this.troncon = this.EOS.troncons.find((item) => {
      return item.id === this.EOS.objectDoc.linearId;
    });
    this.loadingCtrl.create({ message: 'Chargement' })
    .then(
      (loading: HTMLIonLoadingElement) => {
        loading.present();
        this.db.getLocalDB().query('byId', { key: this.troncon.systemeRepDefautId })
        .then(
          (results) => {
            this.systemeReperageList = results.rows;
            if (this.data.systemeRepId) {
              this.systemeReperageId = this.data.systemeRepId;
              if (!this.EOS.isLinear) {
                this.borneDebutId = this.data.borneDebutId;
              } else {
                this.borneDebutId = this.data.borneDebutId;
                this.borneFinId = this.data.borneFinId;
              }
              if (this.EOS.linearPosEditionHandler.endPoint) {
                this.endSR = this.EOS.getEndPointSR();
              } else {
                this.endSR = null;
              }
              this.systemeReperage = this.systemeReperageList.filter((item) => {
                return item.id === this.data.systemeRepId;
              })[0];
              if (!this.systemeReperage) {
                loading.dismiss();
                return;
              }
              this.db.getLocalDB().query('getBornesIdsHB', {
                keys: this.systemeReperage.value.systemeReperageBornes.map(
                  (item) => {
                    return item.borneId;
                  }
              )}).then(
                (res) => {
                  this.systemeReperage.value.systemeReperageBornes.forEach((item1) => {
                    res.rows.forEach((item2) => {
                      if (item1.borneId === item2.id) {
                        item1.libelle = item2.value.libelle;
                        item1.borneGeometry = item2.value.geometry;
                      }
                    });
                  });
                  loading.dismiss();
                }
              );
            }
            if (!this.data.systemeRepId) {
              this.systemeReperageId = null;
              this.borneId = null;
              loading.dismiss();
            }
          }
        );
      }
    );
  }

}
