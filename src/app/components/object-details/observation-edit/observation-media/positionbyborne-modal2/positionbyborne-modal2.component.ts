// @ts-nocheck

import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import WKT from 'ol/format/WKT';
import { DatabaseService } from 'src/app/services/database.service';
import { ObservationEditService } from 'src/app/services/observation-edit.service';
import Point from "ol/geom/Point";
import { EditObjectService } from "../../../../../services/edit-object.service";

@Component({
  selector: 'app-positionbyborne-modal',
  templateUrl: './positionbyborne-modal2.component.html',
  styleUrls: ['./positionbyborne-modal2.component.scss'],
})
export class PositionByBorneModal2Component implements OnInit {

  @Input() data;

  wktFormat = new WKT();
  troncon = null;
  systemeReperage = null;
  systemeReperageList = null;
  systemeReperageId = null;
  borneId = null;
  endSR = null;

  constructor(private modalCtrl: ModalController,
              private db: DatabaseService, private loadingCtrl: LoadingController,
              private EOS: EditObjectService,
              private alertCtrl: AlertController, private OES: ObservationEditService) {
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
    const index = this.systemeReperage.value.systemeReperageBornes.findIndex(
      (item) => {
        return item.borneId === this.data.borneId;
    });

    const srb = this.systemeReperage.value.systemeReperageBornes[index];

    this.data.borneLibelle = srb.libelle;
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
      this.OES.handlePosByBorne(this.data);
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

  init() {
    this.troncon = this.OES.troncons.find((item) => {
      return item.id === this.OES.objectDoc.linearId;
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
              this.borneId = this.data.borneId;
              this.endSR = null;
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
