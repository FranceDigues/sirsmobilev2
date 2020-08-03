import { inject, TestBed } from '@angular/core/testing';
import { CameraService } from "./camera.service"
import { Camera, CameraOptions } from '@ionic-native/camera/ngx'
import { ResolveEnd } from '@angular/router';
import { resolve } from 'dns';

describe('Testing CameraService', () => {
    let cameraService: CameraService;
    let camera: Camera;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CameraService,
                Camera
            ]
        })
    });

    beforeEach(() => {
        cameraService = TestBed.inject(CameraService);
        camera = TestBed.inject(Camera);
    })

    it("#getPictureInGallery should exists", () => {
        let res = typeof cameraService.getPictureInGallery === "function";
        expect(res).toEqual(true);
    })

    it("#getPicture should been called with options in getPictureInGallery", () => {
        const options: CameraOptions = {
            quality: 100,
            destinationType: camera.DestinationType.DATA_URL,
            encodingType: camera.EncodingType.JPEG,
            mediaType: camera.MediaType.PICTURE,
            sourceType: camera.PictureSourceType.PHOTOLIBRARY
        };
        spyOn(camera, 'getPicture').and.returnValue(new Promise((resolve) => {
            resolve('test');
        }))
        cameraService.getPictureInGallery();
        expect(camera.getPicture).toHaveBeenCalledWith(options);
    })

    it("#getPictureInGallery should return data:image/jpeg;base64,test1", async () => {
        spyOn(camera, 'getPicture').and
        .returnValue(new Promise((resolve) => {
            resolve('test1');
        }))
        let res = await cameraService.getPictureInGallery();
        expect(res).toEqual('data:image/jpeg;base64,test1');
    })

    it("#takePhoto should exists", () => {
        let res = typeof cameraService.takePhoto === "function";
        expect(res).toEqual(true);
    })

    it("#getPicture should been called with options in takePhoto", () => {
        const options: CameraOptions = {
            quality: 100,
            destinationType: camera.DestinationType.DATA_URL,
            encodingType: camera.EncodingType.JPEG,
            mediaType: camera.MediaType.PICTURE
        }
        spyOn(camera, 'getPicture').and
        .returnValue(new Promise((resolve) => {
            resolve('test');
        }))
        cameraService.takePhoto();
        expect(camera.getPicture).toHaveBeenCalledWith(options);
    })

    it("#takePhoto should return data:image/jpeg;base64,test2", async () => {
        spyOn(camera, 'getPicture').and
        .returnValue(new Promise((resolve) => {
            resolve('test2');
        }))
        let res = await cameraService.takePhoto();
        expect(res).toEqual('data:image/jpeg;base64,test2');
    })
})
