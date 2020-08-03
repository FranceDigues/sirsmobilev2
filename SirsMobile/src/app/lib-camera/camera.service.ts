import { Injectable } from '@angular/core';
import { CameraModel } from './interface.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx'

@Injectable({
    providedIn: 'root'
})
export class CameraService implements CameraModel {

    image: string;

    constructor(private camera: Camera) { }

    async getPictureInGallery(): Promise<string> {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        };
        await this.camera.getPicture(options).then(
            (ImageData) => {
                let base64Image = 'data:image/jpeg;base64,' + ImageData;
                this.image = base64Image;
            },
            (err) => {
                console.log(err);
            }
        )
        return this.image;
    }

    async takePhoto(): Promise<string> {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }
        await this.camera.getPicture(options).then(
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
