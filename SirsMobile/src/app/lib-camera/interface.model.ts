import { CameraOptions } from '@ionic-native/camera/ngx';

export interface CameraModel {
    defaultOptions?: CameraOptions;

    getPictureInGallery: (options?: CameraOptions) => string;
}
