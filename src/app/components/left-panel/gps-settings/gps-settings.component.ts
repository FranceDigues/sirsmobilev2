import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GeolocationService } from "../../../services/geolocation.service";
import { ToastController } from "@ionic/angular";

@Component({
    selector: 'app-gps-settings',
    templateUrl: './gps-settings.component.html',
    styleUrls: ['./gps-settings.component.scss'],
})
export class GpsSettingsComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();

    constructor(public geolocationService: GeolocationService,
                private toastCtrl: ToastController) {
    }

    ngOnInit() {
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    async validate() {
        if (this.geolocationService.isEnabled) {
            // Clear old GPS configuration
            this.geolocationService.isEnabled = false;
            // Reactivate GPS
            this.geolocationService.isEnabled = true;
        }

        localStorage.setItem('gpsUpdateTimout', JSON.stringify(this.geolocationService.updateTimeout));
        localStorage.setItem('ultraAccuracy', JSON.stringify(this.geolocationService.ultraAccuracy));
        localStorage.setItem('gpsConfig', JSON.stringify(this.geolocationService.gpsOptions));
        const toast = await this.toastCtrl.create({
            message: 'Les paramètres GPS ont été mis à jour avec succès',
            duration: 5000
        });
        await toast.present();
    }
}
