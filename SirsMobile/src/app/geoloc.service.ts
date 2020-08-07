import { Injectable } from '@angular/core';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import { OLService } from '@lib-map/ol.service';
import * as moment from 'moment';

import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { transform } from 'ol/proj';

@Injectable({
    providedIn: 'root'
})
export class GeolocService {

    gpsAccuracy = null;
    coords = null;
    lastGPSUpdate = null;

    constructor(private geoloc: Geolocation, private loadingCtrl: LoadingController,
                private ol: OLService) {}

    getCoords() {
        return this.coords;
    }

    getGPSAccuracy() {
        return this.gpsAccuracy;
    }

    getLastGPSUpdate()  {
        return this.lastGPSUpdate;
    }

    async getCurrentLocation(): Promise<Coordinates> {
        const options: GeolocationOptions = {
            maximumAge: 20000,
            timeout: 50000,
            enableHighAccuracy: true
        };
        let loading = await this.loadingCtrl.create({
          message: 'En attente de location'
        })
        loading.present();
        return new Promise((resolve, rejects) => {
            this.geoloc.getCurrentPosition(options)
            .then(
              (position) => {
                console.log('position', position);
                this.coords = position.coords;
                this.gpsAccuracy = Math.round(position.coords.accuracy);
                this.lastGPSUpdate = moment().format('DD/MM/YYYY à HH:mm:ss');
                loading.dismiss();
                resolve(position.coords);
              },
              (error) => {
                loading.dismiss();
                rejects(error);
              }
            );
        });
    }

    // zoomToCoords(coords) { // TODO change this fonction to another service
    //   if (coords) {
    //     let map = this.ol.getMap();
    //     map.getView().setCenter(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'));
    //     map.getView().setZoom(18);
    //   }
    // }
}
