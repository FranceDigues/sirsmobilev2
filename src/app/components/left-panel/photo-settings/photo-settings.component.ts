import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToastController } from "@ionic/angular";
import { CameraService } from "@ionic-lib/lib-camera/camera.service";

interface ResolutionDef {
    label: string;
    width: number;
    height: number;
}

@Component({
    selector: 'app-photo-settings',
    templateUrl: './photo-settings.component.html',
    styleUrls: ['./photo-settings.component.scss'],
})
export class PhotoSettingsComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();
    quality: number = this.cameraService.DEFAULT_OPTIONS.quality;
    targetWidth = this.cameraService.DEFAULT_OPTIONS.targetWidth;
    targetHeight = this.cameraService.DEFAULT_OPTIONS.targetHeight;
    resolution: string;
    resolutionList: Array<ResolutionDef>;

    constructor(private cameraService: CameraService,
                private toastCtrl: ToastController) {

        this.resolutionList = [
            {
                label: '640 x 480',
                width: 640,
                height: 480
            },
            {
                label: '800 x 600',
                width: 800,
                height: 600
            },
            {
                label: '1024 x 768',
                width: 1024,
                height: 768
            },
            {
                label: '1280 x 720',
                width: 1280,
                height: 720
            },
            {
                label: '1600 x 1200',
                width: 1600,
                height: 1200
            },
            {
                label: '2048 x 1536',
                width: 2048,
                height: 1536
            }
        ];

        this.resolution = `${this.targetWidth} x ${this.targetHeight}`;
    }

    ngOnInit() {
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    async validate() {
        // Update global photo settings
        this.cameraService.DEFAULT_OPTIONS.quality = this.quality;
        this.cameraService.DEFAULT_OPTIONS.targetHeight = this.targetHeight;
        this.cameraService.DEFAULT_OPTIONS.targetWidth = this.targetWidth;

        // Persist photo settings in localStorage
        localStorage.setItem('photoQuality', JSON.stringify(this.quality));
        localStorage.setItem('photoHeight', JSON.stringify(this.targetHeight));
        localStorage.setItem('photoWidth', JSON.stringify(this.targetWidth));

        const toast = await this.toastCtrl.create({
            message: 'Les paramètres de photo ont été mis à jour avec succès',
            duration: 5000
        });
        await toast.present();
    }

    updateResolution(resolution: string) {
        const resolutionDef = this.resolutionList.find(item => item.label === resolution);
        this.targetWidth = resolutionDef?.width;
        this.targetHeight = resolutionDef?.height;
    }
}
