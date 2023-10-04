import { Injectable } from '@angular/core';
import { CameraModel, Options } from './interface.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Injectable({
    providedIn: 'root'
})
export class CameraService implements CameraModel {
     DEFAULT_OPTIONS: CameraOptions = {
        quality: +localStorage.getItem('photoQuality') || 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        targetHeight: +localStorage.getItem('photoHeight') || 720,
        targetWidth: +localStorage.getItem('photoWidth') || 1280
    };

    image: string;

    constructor(private camera: Camera) {
    }

    async getPhotoFromGallery(userOptions?: Options): Promise<string> {
        const finalOptions = Object.assign({ sourceType: this.camera.PictureSourceType.PHOTOLIBRARY }, this.DEFAULT_OPTIONS, userOptions);
        return 'data:image/jpeg;base64,' + await this.camera.getPicture(finalOptions);
    }

    async takePhoto(userOptions?: Options): Promise<string> {
        const finalOptions = Object.assign({}, this.DEFAULT_OPTIONS, userOptions);
        await this.camera.getPicture(finalOptions).then(
            (ImageData) => {
                this.image = 'data:image/jpeg;base64,' + ImageData;
            }, (err) => {
                console.log(err);
            }
        );
        return this.image;
    }

    calculateImageSize(base64String) {
        let padding;
        let inBytes;
        let base64StringLength;
        if (base64String.endsWith('==')) {
            padding = 2;
        } else if (base64String.endsWith('=')) {
            padding = 1;
        } else {
            padding = 0;
        }

        base64StringLength = base64String.length;
        inBytes = (base64StringLength / 4) * 3 - padding;
        return inBytes;
    }

    convertBlobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(blob);
        });
    }

}
