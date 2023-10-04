import { TestBed } from '@angular/core/testing';
import { CameraService } from './camera.service';
import { CameraModel, Options } from './interface.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

describe('Testing CameraService', () => {
    let cameraService: CameraService;
    let camera: Camera;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CameraService,
                Camera
            ]
        });
    });

    beforeEach(() => {
        cameraService = TestBed.inject(CameraService);
        camera = TestBed.inject(Camera);
    });

    it('getPhotoFromGallery method should exists', () => {
        const res = typeof cameraService.getPhotoFromGallery === 'function';
        expect(res).toEqual(true);
    });

    it('getPicture method should been called with options in getPhotoFromGallery', () => {
        const options: CameraOptions = {
            quality: 50,
            destinationType: camera.DestinationType.DATA_URL,
            encodingType: camera.EncodingType.JPEG,
            mediaType: camera.MediaType.PICTURE,
            sourceType: camera.PictureSourceType.PHOTOLIBRARY
        };
        spyOn(camera, 'getPicture').and.returnValue(new Promise((resolve) => {
            resolve('test');
        }));
        cameraService.getPhotoFromGallery();
        expect(camera.getPicture).toHaveBeenCalledWith(options);
    });

    it('getPhotoFromGallery method should return data:image/jpeg;base64,test1', async () => {
        spyOn(camera, 'getPicture').and
        .returnValue(new Promise((resolve) => {
            resolve('test1');
        }));
        const res = await cameraService.getPhotoFromGallery();
        expect(res).toEqual('data:image/jpeg;base64,test1');
    });

    it('takePhoto method should exists', () => {
        const res = typeof cameraService.takePhoto === 'function';
        expect(res).toEqual(true);
    });

    it('getPicture method should been called with options in takePhoto', () => {
        const options: CameraOptions = {
            quality: 50,
            destinationType: camera.DestinationType.DATA_URL,
            encodingType: camera.EncodingType.JPEG,
            mediaType: camera.MediaType.PICTURE
        };
        spyOn(camera, 'getPicture').and
        .returnValue(new Promise((resolve) => {
            resolve('test');
        }));
        cameraService.takePhoto();
        expect(camera.getPicture).toHaveBeenCalledWith(options);
    });

    it('takePhoto method should return data:image/jpeg;base64,test2', async () => {
        spyOn(camera, 'getPicture').and
        .returnValue(new Promise((resolve) => {
            resolve('test2');
        }));
        const res = await cameraService.takePhoto();
        expect(res).toEqual('data:image/jpeg;base64,test2');
    });
});
