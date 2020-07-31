import { Injectable } from '@angular/core';
import { CameraModel } from './interface.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx'

@Injectable({
    providedIn: 'root'
})
export class ClassCameraService implements CameraModel {

    defaultOptions: CameraOptions;
    image: string;

    constructor(private camera: Camera) { }

    getPictureInGallery(): string {
        return null;
    }

    takePhoto(): string {
        this.defaultOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }
        this.camera.getPicture(this.defaultOptions).then(
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
