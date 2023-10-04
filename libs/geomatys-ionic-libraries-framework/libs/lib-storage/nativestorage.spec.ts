import { TestBed } from '@angular/core/testing';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { NativeStorageService } from './nativestorage.service';

describe('Testing NativeStorageService', () => {

    let nativeStorageService: NativeStorageService;
    let nativeStorage: NativeStorage;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NativeStorageService,
                NativeStorage
            ]
        });
    });

    beforeEach(() => {
        nativeStorageService = TestBed.inject(NativeStorageService);
        nativeStorage = TestBed.inject(NativeStorage);
    });

    it('setItem method should exists', () => {
        const res = typeof nativeStorageService.setItem === 'function';
        expect(res).toEqual(true);
    });

    it('setItem method should call nativeStorage service with setItem method', () => {
        spyOn(nativeStorage, 'setItem');
        const arg1 = 'key';
        const arg2 = { result: 'SUCESS' };
        nativeStorageService.setItem(arg1, arg2);
        expect(nativeStorage.setItem).toHaveBeenCalledWith(arg1, arg2);
    });

    it('getItem method should exists', () => {
        const res = typeof nativeStorageService.getItem === 'function';
        expect(res).toEqual(true);
    });

    it('getItem method should call nativeStorage service with getItem method', () => {
        spyOn(nativeStorage, 'getItem').and
        .returnValue(new Promise((resolve) => {
            resolve({ result: 'SUCESS' });
        }));
        const arg = 'key';

        nativeStorageService.getItem(arg);
        expect(nativeStorage.getItem).toHaveBeenCalledWith(arg);
    });

    it('getItem method should return { result: SUCESS }', async () => {
        spyOn(nativeStorage, 'getItem').and
        .returnValue(new Promise((resolve) => {
            resolve({ result: 'SUCESS' });
        }));
        const arg = 'key';
        const expectedRes = { result: 'SUCESS' };

        const res = await nativeStorageService.getItem(arg);
        expect(res).toEqual(expectedRes);
    });

    it('removeItem method should exists', () => {
        const res = typeof nativeStorageService.removeItem === 'function';
        expect(res).toEqual(true);
    });

    it('removeItem method should call nativeStorage service with removeItem method', () => {
        spyOn(nativeStorage, 'remove');
        const arg = 'key';
        nativeStorageService.removeItem(arg);
        expect(nativeStorage.remove).toHaveBeenCalledWith(arg);
    });

});
