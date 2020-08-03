import { CameraOptions } from '@ionic-native/camera/ngx';

export interface CameraModel {

    getPictureInGallery: () => Promise<string>;

    takePhoto: () => Promise<string>;
}
