import { Injectable } from '@angular/core';
import { Coordinates, Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { DatabaseService } from './database.service';
import { DatabaseModel } from '../components/database-connection/models/database.model';

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    private gpsAccuracy = null;
    private coords = null;
    private lastGPSUpdate = null;
    private enabled = false;

    constructor(private geolocation: Geolocation,
                private loadingCtrl: LoadingController,
                private databaseService: DatabaseService) {
        this.databaseService.getCurrentDatabaseSettings()
            .then(
                (config: DatabaseModel) => {
                    this.enabled = config.context.settings.geolocation;
                }
            );
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

    get isEnabled(): boolean {
        return this.enabled;
    }

    set isEnabled(flag: boolean) {
        this.databaseService.changeGeolocationFlag(flag);
    }
}
