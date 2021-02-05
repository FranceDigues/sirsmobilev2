import { Injectable } from '@angular/core';
import { Coordinates, Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import * as moment from 'moment';


@Injectable({
    providedIn: 'root'
})
export class GeolocationService {

    gpsAccuracy = null;
    coords = null;
    lastGPSUpdate = null;
    enableGeoloc = true;

    constructor(private geolocation: Geolocation, private loadingCtrl: LoadingController) {
    }

    getCoords() {
        return this.coords;
    }

    getGPSAccuracy() {
        return this.gpsAccuracy;
    }

    getLastGPSUpdate() {
        return this.lastGPSUpdate;
    }

    async getCurrentLocation(): Promise<Coordinates> {
        const options: GeolocationOptions = {
            maximumAge: 20000,
            timeout: 50000,
            enableHighAccuracy: true
        };
        const loading = await this.loadingCtrl.create({
            message: 'En attente de location'
        });
        loading.present();
        return new Promise((resolve, rejects) => {
            this.geolocation.getCurrentPosition(options)
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
}
