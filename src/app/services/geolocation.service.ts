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
    public updateTimeout: number; // gps update timeout in ms
    public gpsOptions: GeolocationOptions;


    constructor(private geolocation: Geolocation,
                private geolocLayerService: GeolocLayerService,
                private loadingCtrl: LoadingController) {
        this.update = this.update.bind(this);
        this.updateTimeout = localStorage.getItem('gpsUpdateTimout') ? +localStorage.getItem('gpsUpdateTimout') : (30 * 1000); // gps update timeout in ms
        this.gpsOptions = JSON.parse(localStorage.getItem('gpsConfig')) || {
            maximumAge: 60,
            timeout: 10000,
            enableHighAccuracy: true
        };
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
        let loading: HTMLIonLoadingElement;
        if (!silent) {
            loading = await this.loadingCtrl.create({
                message: 'En attente de localisation'
            });
            await loading.present();
        }
        try {
            const position: Geoposition = await this.geolocation.getCurrentPosition(this.gpsOptions);
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
            this.updateIntervalId = setInterval(this.update, this.updateTimeout);
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
        this.getCurrentLocation(true).then(console.log, console.error);
    }
}
