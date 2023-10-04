import { DestinationType, EncodingType } from '@ionic-native/camera/ngx';

export interface Options {
    /** Picture quality in range 0-100. Default is 50 */
    quality?: number;
    /**
     * Choose the format of the return value.
     * Defined in Camera.DestinationType. Default is FILE_URI.
     *      DATA_URL : 0,   Return image as base64-encoded string
     *                      (DATA_URL can be very memory intensive and cause app crashes or out of memory errors.
     *                      Use FILE_URI or NATIVE_URI if possible),
     *      FILE_URI : 1,   Return image file URI,
     *      NATIVE_URI : 2  Return image native URI
     *          (e.g., assets-library:// on iOS or content:// on Android)
     */
    destinationType?: DestinationType;
    /**
     * Choose the returned image file's encoding.
     * Defined in Camera.EncodingType. Default is JPEG
     *      JPEG : 0    Return JPEG encoded image
     *      PNG : 1     Return PNG encoded image
     */
    encodingType?: EncodingType;
    /**
     * Width in pixels to scale image. Must be used with targetHeight.
     * Aspect ratio remains constant.
     */
    targetWidth?: number;
    /**
     * Height in pixels to scale image. Must be used with targetWidth.
     * Aspect ratio remains constant.
     */
    targetHeight?: number;
}

export interface CameraModel {

    getPhotoFromGallery: (options?: Options) => Promise<string>;

    takePhoto: (options?: Options) => Promise<string>;
}
