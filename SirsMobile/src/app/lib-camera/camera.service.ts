import { Injectable } from '@angular/core';
import { CameraModel } from './interface.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx'

@Injectable({
    providedIn: 'root'
})
export class CameraService implements CameraModel {

    image: string;

    constructor(private camera: Camera) { }

    private async openGallery() {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            targetWidth: 1000,
            targetHeight: 1000,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        };
        return await this.camera.getPicture(options);
    }

    getPictureInGallery(): string {
        this.openGallery().then(
            (galleryImage) => {
                this.image = 'data:image/jpeg;base64,' + galleryImage;
            }
        );
        return this.image;
    }

    takePhoto(): string {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }
        this.camera.getPicture(options).then(
            (ImageData) => {
                let base64Image = 'data:image/jpeg;base64,' + ImageData;
                this.image = base64Image;
            }, (err) => {
                console.log(err);
            }
        )
        return this.image;
    }
}
