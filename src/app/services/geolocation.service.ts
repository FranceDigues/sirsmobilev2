import { Injectable } from '@angular/core';
import { Coordinates, Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { GeolocLayerService } from './geoloc-layer.service';

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    private gpsAccuracy: number = null;
    private coords: Coordinates = null;
    private lastGPSUpdate: string = null;
    private enabled: boolean = false;
    private updateIntervalId: any;
    private onPositionUpdatedSubject: Subject<Coordinates> = new Subject<Coordinates>();

    private readonly UPDATE_TIMEOUT: number = 30 * 1000; // gps update timeout in ms

    constructor(private geolocation: Geolocation,
                private geolocLayerService: GeolocLayerService,
                private loadingCtrl: LoadingController) {
        this.update = this.update.bind(this);
    }

    getCoords(): Coordinates {
        return this.coords;
    }

    getGPSAccuracy(): number {
        return this.gpsAccuracy;
    }

    getLastGPSUpdate(): string {
        return this.lastGPSUpdate;
    }

    async getCurrentLocation(silent: boolean = false): Promise<Coordinates> {
        const options: GeolocationOptions = {
            maximumAge: 60000,
            timeout: 10000,
            enableHighAccuracy: true
        };
        let loading: HTMLIonLoadingElement;
        if (!silent) {
            loading = await this.loadingCtrl.create({
                message: 'En attente de localisation'
            });
            await loading.present();
        }
        try {
            const position: Geoposition = await this.geolocation.getCurrentPosition(options);
            this.coords = position.coords;
            this.gpsAccuracy = Math.round(position.coords.accuracy);
            this.lastGPSUpdate = moment().format('DD/MM/YYYY à HH:mm:ss');
            if (!silent) await loading.dismiss();
            this.onPositionUpdatedSubject.next(this.coords);
            return position.coords;
        } catch (e) {
            if (!silent) await loading.dismiss();
            throw e;
        }
    }

    get isEnabled(): boolean {
        return this.enabled;
    }

    set isEnabled(flag: boolean) {
        this.enabled = flag;
        if (this.enabled) {
            this.update();
            this.updateIntervalId = setInterval(this.update, this.UPDATE_TIMEOUT);
        } else if (this.updateIntervalId !== undefined) {
            clearInterval(this.updateIntervalId);
            this.updateIntervalId = undefined;
            this.geolocLayerService.clearGeolocLayer();
        }
    }

    get onPositionUpdated(): Observable<Coordinates> {
        return this.onPositionUpdatedSubject.asObservable();
    }

    private update(): void {
        console.debug('Update GPS');
        this.getCurrentLocation(true).then();
    }
}
