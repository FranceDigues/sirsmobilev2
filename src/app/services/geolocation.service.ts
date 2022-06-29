import { Injectable } from '@angular/core';
import { Coordinates, Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';

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

    private readonly UPDATE_TIMEOUT: number = 10 * 1000; // gps update timeout in ms

    constructor(private geolocation: Geolocation,
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
            maximumAge: 20000,
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
        return new Promise((resolve, rejects) => {
            this.geolocation.getCurrentPosition(options)
                .then(
                    (position) => {
                        this.coords = position.coords;
                        this.gpsAccuracy = Math.round(position.coords.accuracy);
                        this.lastGPSUpdate = moment().format('DD/MM/YYYY à HH:mm:ss');
                        if (!silent) loading.dismiss();
                        this.onPositionUpdatedSubject.next(this.coords);
                        resolve(position.coords);
                    },
                    (error) => {
                        if (!silent) loading.dismiss();
                        rejects(error);
                    }
                );
        });
    }

    get isEnabled(): boolean {
        return this.enabled;
    }

    set isEnabled(flag: boolean) {
        this.enabled = flag;
        if (this.enabled) {
            this.updateIntervalId = setInterval(this.update, this.UPDATE_TIMEOUT);
        } else if (this.updateIntervalId !== undefined) {
            clearInterval(this.updateIntervalId);
            this.updateIntervalId = undefined;
        }
    }

    get onPositionUpdated(): Observable<Coordinates> {
        return this.onPositionUpdatedSubject.asObservable();
    }

    private update(): void {
        this.getCurrentLocation(true).then();
    }
}
