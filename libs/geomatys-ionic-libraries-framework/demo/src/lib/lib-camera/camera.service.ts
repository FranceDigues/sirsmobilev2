import { Injectable } from '@angular/core';
import { CameraModel, Options } from './interface.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Injectable({
    providedIn: 'root'
})
export class CameraService implements CameraModel {

    image: string;

    constructor(private camera: Camera) { }

    private getMergedOptions(defaultOptions: CameraOptions, userOptions: Options): CameraOptions {
        if (!userOptions) {
            return defaultOptions;
        }
        if (userOptions.destinationType) {
            defaultOptions.destinationType = userOptions.destinationType;
        }
        if (userOptions.encodingType) {
            defaultOptions.encodingType = userOptions.encodingType;
        }
        if (userOptions.quality) {
            defaultOptions.quality = userOptions.quality;
        }
        if (userOptions.targetHeight) {
            defaultOptions.targetHeight = userOptions.targetHeight;
        }
        if (userOptions.targetWidth) {
            defaultOptions.targetWidth = userOptions.targetWidth;
        }
        return defaultOptions;
    }

    async getPhotoFromGallery(userOptions?: Options): Promise<string> {
        const defaultOptions: CameraOptions = {
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        };
        const finalOptions = this.getMergedOptions(defaultOptions, userOptions);
        await this.camera.getPicture(finalOptions).then(
            (ImageData) => {
                const base64Image = 'data:image/jpeg;base64,' + ImageData;
                this.image = base64Image;
            },
            (err) => {
                console.log(err);
            }
        );
        return this.image;
    }

    async takePhoto(userOptions?: Options): Promise<string> {
        const defaultOptions: CameraOptions = {
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        };
        const finalOptions = this.getMergedOptions(defaultOptions, userOptions);
        await this.camera.getPicture(finalOptions).then(
            (ImageData) => {
                const base64Image = 'data:image/jpeg;base64,' + ImageData;
                this.image = base64Image;
            }, (err) => {
                console.log(err);
            }
        );
        return this.image;
    }

}
