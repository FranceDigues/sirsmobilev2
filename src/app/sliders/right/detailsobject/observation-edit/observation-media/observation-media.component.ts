import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ObservationEditService } from 'src/app/observationedit.service';
import { ModalController } from '@ionic/angular';
import { EditObjectService } from 'src/app/editobjects.service';
import { PositionByBorneModal2Component } from './positionbyborne-modal2/positionbyborne-modal2.component';
import { GeolocService } from 'src/app/geoloc.service';

@Component({
  selector: 'observation-media',
  templateUrl: './observation-media.component.html',
  styleUrls: ['./observation-media.component.scss'],
})
export class ObservationMediaComponent implements OnInit {

  @Output() readonly viewChange = new EventEmitter<string>();

  view: 'media' | 'map';

  constructor(public OES: ObservationEditService, private modalCtrl: ModalController,
              private geolocService: GeolocService) {
                this.view = 'media';
              }

  ngOnInit() {}

  cancel() {
    this.viewChange.emit('form');
  }

  setView(str: 'media' | 'map') {
    this.view = str;
  }

  initData() {
    // Create borne position
    if (!this.OES.mediaOptions.systemeRepId) {
        return  {
            systemeRepId: '',
            borne_aval: '',
            borne_distance: 0,
            borneId: '',
            borneLibelle: '',
            media: true
        };
    }

    // Edit Debut
    if (this.OES.mediaOptions.systemeRepId) {
        return {
            systemeRepId: this.OES.mediaOptions.systemeRepId,
            borne_aval: this.OES.mediaOptions.borne_debut_aval ? 'true' : 'false',
            borne_distance: this.OES.mediaOptions.borne_debut_distance,
            borneId: this.OES.mediaOptions.borneDebutId,
            borneLibelle: this.OES.mediaOptions.borneDebutLibelle || '',
            media: true
        };
    }
  }

  async selectPosBySR() {
    const data = this.initData();
    const modal = await this.modalCtrl.create({
      component: PositionByBorneModal2Component,
      animated: true,
      cssClass: 'modal-css',
      componentProps: {
        data: data
      }
    });
    return await modal.present();
  }

  locateMe() {
    this.geolocService.getCurrentLocation()
    .then(
      (position) => {
        this.OES.handlePos(position);
      }
    );
  }

}
