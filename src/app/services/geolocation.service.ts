import { Injectable } from '@angular/core';
import { Coordinates, Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { Observable, pipe, Subject } from 'rxjs';
import { GeolocLayerService } from './geoloc-layer.service';
import { throttleTime } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    private gpsAccuracy: number = null;
    private coords: Coordinates = null;
    private lastGPSUpdate: string = null;
    private enabled: boolean = false;
    private updateIntervalId: any;
    private positionWatcher$: any;
    private onPositionUpdatedSubject: Subject<Coordinates> = new Subject<Coordinates>();
    public updateTimeout: number; // gps update timeout in ms
    public ultraAccuracy: boolean;
    public gpsOptions: GeolocationOptions;
    alertGPS;


    constructor(private geolocation: Geolocation,
                private geolocLayerService: GeolocLayerService,
                private loadingCtrl: LoadingController,
                private alertController: AlertController) {
        this.update = this.update.bind(this);
        this.updateTimeout = localStorage.getItem('gpsUpdateTimout') ? +localStorage.getItem('gpsUpdateTimout') : (30 * 1000); // gps update timeout in ms
        this.ultraAccuracy = localStorage.getItem('ultraAccuracy') ? !!localStorage.getItem('ultraAccuracy') : false; // gps update timeout in ms
        this.gpsOptions = JSON.parse(localStorage.getItem('gpsConfig')) || {
            maximumAge: 60000,
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
            const coordinates = this.handlePosition(position);
            if (!silent) await loading.dismiss();
            return coordinates;
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
            // Ultra High Accuracy config
            if (this.ultraAccuracy) {
                this.enableUltraHighAccuracy();
            } else {
                this.update();
                this.updateIntervalId = setInterval(this.update, this.updateTimeout);
            }
        } else {
            this.clearIntervalGeolocation();
            this.clearHighAccuracyGeolocation();
            this.geolocLayerService.clearGeolocLayer();
        }
    }

    get onPositionUpdated(): Observable<Coordinates> {
        return this.onPositionUpdatedSubject.asObservable();
    }

    private update(): void {
        this.getCurrentLocation(true).then(console.log, (err) => {
            this.openModal('Erreur lors de la localisation GPS', err.message).then();
        });
    }

    async openModal(header: string, message: string) {
        if (this.alertGPS) {
            this.alertGPS.dismiss();
        }
        this.alertGPS = await this.alertController.create({
            header: header,
            cssClass: 'gps',
            message: message,
            buttons: ['OK'],
            backdropDismiss: true
        });

        await this.alertGPS.present();
    }

    handlePosition(position: Geoposition): Coordinates {
        this.coords = position.coords;
        this.gpsAccuracy = Math.round(position.coords.accuracy);
        this.lastGPSUpdate = moment().format('DD/MM/YYYY à HH:mm:ss');
        this.onPositionUpdatedSubject.next(this.coords);
        return position.coords;
    }

    enableUltraHighAccuracy() {
        this.positionWatcher$ = this.geolocation.watchPosition(this.gpsOptions)
            .pipe(throttleTime(this.updateTimeout))
            .subscribe({
                next: position => this.handlePosition(position as Geoposition),
                error: console.error
            });
    }

    clearHighAccuracyGeolocation() {
        this.positionWatcher$?.unsubscribe();
        this.positionWatcher$ = null;
    }

    private clearIntervalGeolocation() {
        if (this.updateIntervalId !== undefined) {
            clearInterval(this.updateIntervalId);
            this.updateIntervalId = undefined;
        }
    }
}
