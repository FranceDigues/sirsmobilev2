import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GeolocationService } from "../../../services/geolocation.service";
import { LoadingController } from "@ionic/angular";

@Component({
    selector: 'app-gps-settings',
    templateUrl: './gps-settings.component.html',
    styleUrls: ['./gps-settings.component.scss'],
})
export class GpsSettingsComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();

    constructor(public geolocationService: GeolocationService,
                private loadingCtrl: LoadingController,) {
    }

    ngOnInit() {
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    async validate() {
        const loading = await this.loadingCtrl.create({
            message: 'Déploiement en cours ...'
        });
        await loading.present();

        if (this.geolocationService.isEnabled) {
            // Clear old GPS configuration
            this.geolocationService.isEnabled = false;
            // Reactivate GPS
            this.geolocationService.isEnabled = true;
        }

        localStorage.setItem('gpsUpdateTimout', JSON.stringify(this.geolocationService.updateTimeout));
        localStorage.setItem('gpsConfig', JSON.stringify(this.geolocationService.gpsOptions));
        await loading.dismiss();
    }
}
