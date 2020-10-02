import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { EditObjectService } from 'src/app/editobjects.service';
import { DatabaseService } from '../../../database.service';
import { PositionByBorneModalComponent } from './positionbyborne-modal/positionbyborne-modal.component';


@Component({
  selector: 'app-editobjects',
  templateUrl: './editobjects.component.html',
  styleUrls: ['./editobjects.component.scss'],
})
export class RightSlideEditObjectsComponent implements OnInit {

  tab = 'fields';
  view = 'form';

  // * EOS for Edit Object Service -> to have better lisibility

  constructor(public EOS: EditObjectService, private route: Router, private alertCtrl: AlertController,
              private activeRoute: ActivatedRoute, private databaseService: DatabaseService,
              private modalCtrl: ModalController) {
                const type = this.activeRoute.snapshot.paramMap.get('type');
                const id = this.activeRoute.snapshot.paramMap.get('id');
                console.log('init Service');
                this.EOS.init(type, id);
  }

  ngOnInit() {}

  backToMain() {
    console.log('EOS ObjectDoc', this.EOS.objectDoc);
    this.route.navigateByUrl('/main');
  }

  changeSlidePath(path: string) {
    this.view = path;
    console.log('view : ', this.view);
  }

  displayName(str: string) {
    for(let i = 1; i < str.length; i++) {
      const char = str.charAt(i);
      if (char !== `'` && i > 0) {
          if (char === char.toUpperCase()) {
            str = str.slice(0, i) + ' ' + str.slice(i);
            i++;
            continue;
          }
      }
    }
    return str;
  }

  setTab(tab) {
    if (tab !== this.tab) {
      this.tab = tab;
    }
  }

  setView(view) {
    if (view !== this.view) {
      this.view = view;
    }
  }

  selectPos() {
    this.alertCtrl.create({
      header: 'Localisation manuelle',
      message: 'Voulez vous localiser l\'objet manuellement ? Cette opération va écraser les anciennes valeurs de localisation',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.setView('map');
          }
        }
      ]
    }).then(
      (alert) => {
        alert.present();
      }
    );
  }

  selectPosLine() {
      this.alertCtrl.create({
        header: 'Localisation manuelle',
        message: 'Voulez vous localiser l\'objet manuellement ? Cette opération va écraser les anciennes valeurs de localisation',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel'
          },
          {
            text: 'Ok',
            handler: () => {
              this.setView('drawLine');
            }
          }
        ]
      }).then(
        (alert) => {
          alert.present();
        }
      );
  }

  private initData() {
    if (!this.EOS.objectDoc.systemeRepId) {
      return {
        systemeRepId: '',
        borne_debut_aval: '',
        borne_fin_aval: '',
        borne_aval: '',
        borne_debut_distance: 0,
        borne_fin_distance: 0,
        borne_distance: 0,
        borneDebutId: '',
        borneFinId: '',
        borneId: '',
        borneLibelle: '',
        borneDebutLibelle: '',
        borneFinLibelle: ''
      };
    } else if (!this.EOS.isLinear) {
      return {
        systemeRepId: this.EOS.objectDoc.systemeRepId,
        borne_debut_aval: this.EOS.objectDoc.borne_debut_aval ? 'true' : 'false',
        borne_debut_distance: this.EOS.objectDoc.borne_debut_distance,
        borneDebutId: this.EOS.objectDoc.borneDebutId,
        borneDebutLibelle: this.EOS.objectDoc.borneDebutLibelle || ''
      };
    } else {
      return {
          systemeRepId: this.EOS.objectDoc.systemeRepId,
          borne_debut_aval: this.EOS.objectDoc.borne_debut_aval ? 'true' : 'false',
          borne_fin_aval: this.EOS.objectDoc.borne_debut_aval ? 'true' : 'false',
          borne_debut_distance: this.EOS.objectDoc.borne_debut_distance || 0,
          borne_fin_distance: this.EOS.objectDoc.borne_fin_distance || 0,
          borneDebutId: this.EOS.objectDoc.borneDebutId || '',
          borneFinId: this.EOS.objectDoc.borneFinId || '',
          borneDebutLibelle: this.EOS.objectDoc.borneDebutLibelle || '',
          borneFinLibelle: this.EOS.objectDoc.borneFinLibelle || ''
        };
      }
    }
    // ! TODO Decides what to do -> don't know
    // // Edit Debut
    // if (this.EOS.objectDoc.systemeRepId && !this.EOS.linearPosEditionHandler.endPoint) {
    //   return {
    //     systemeRepId: this.EOS.objectDoc.systemeRepId,
    //     borne_aval: this.EOS.objectDoc.borne_debut_aval ? 'true' : 'false',
    //     borne_distance: this.EOS.objectDoc.borne_debut_distance,
    //     borneId: this.EOS.objectDoc.borneDebutId,
    //     borneLibelle: this.EOS.objectDoc.borneDebutLibelle || ''
    //   };
    // }
    // // Edit fin
    // if (this.EOS.objectDoc.systemeRepId && this.EOS.linearPosEditionHandler.endPoint) {
    //   return {
    //     systemeRepId: this.EOS.objectDoc.systemeRepId,
    //     borne_aval: this.EOS.objectDoc.borne_fin_aval ? 'true' : 'false',
    //     borne_distance: this.EOS.objectDoc.borne_fin_distance,
    //     borneId: this.EOS.objectDoc.borneFinId,
    //     borneLibelle: this.EOS.objectDoc.borneFinLibelle || ''
    //   };
    // }

  async selectPosBySR() {
    const data = this.initData();
    const modal = await this.modalCtrl.create({
      component: PositionByBorneModalComponent,
      animated: true,
      cssClass: 'modal-css',
      componentProps: {
        data: data
      }
    });
    return await modal.present();
  }

  drawPolygon() {
      this.alertCtrl.create({
        header: 'Localisation manuelle',
        message: 'Voulez vous localiser l\'objet manuellement ? Cette opération va écraser les anciennes valeurs de localisation',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel'
          },
          {
            text: 'Ok',
            handler: () => {
              this.setView('drawPolygon');
            }
          }
        ]
      }).then(
        (alert) => {
          alert.present();
        }
      );
  }

}

@Pipe({
  name: 'lonlat'
})
export class LonLatPipe  implements PipeTransform {

  transform(coordinate: any, fallback: any) {
    if (coordinate) {
      return (coordinate[0].toFixed(3).toString() + ', ' + coordinate[1].toFixed(3).toString());
    }
    return fallback;
  }
}
