import { CameraOptions } from '@ionic-native/camera/ngx';

export interface CameraModel {

    getPictureInGallery: () => string;

    takePhoto: () => string;
}
