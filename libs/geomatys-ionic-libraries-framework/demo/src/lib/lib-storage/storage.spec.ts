import { TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { StorageService } from './storage.service';

describe('Testing StorageService', () => {
    let storageService: StorageService;
    let storage: Storage;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                StorageService,
            ],
            imports: [
                IonicStorageModule.forRoot(),
                IonicModule.forRoot(),
            ]
        });
    });

    beforeEach(() => {
        storageService = TestBed.inject(StorageService);
        storage = TestBed.inject(Storage);
    });

    it('setItem method should exists', () => {
        const res = typeof storageService.setItem === 'function';
        expect(res).toEqual(true);
    });

    it('setItem method should call Storage service with set method', () => {
        spyOn(storage, 'set');
        const arg1 = 'key';
        const arg2 = { success: 'SUCCESS' };
        const expectedSecondArg = '{"success":"SUCCESS"}';
        storageService.setItem(arg1, arg2);
        expect(storage.set).toHaveBeenCalledWith(arg1, expectedSecondArg);
    });

    it('getItem method should exists', () => {
        const res = typeof storageService.getItem === 'function';
        expect(res).toEqual(true);
    });

    it('getItem method should call Storage service with get method', () => {
        spyOn(storage, 'get').and
        .returnValue(new Promise((resolve) => {
            resolve('{"success":"SUCCESS"}');
        }));
        const arg1 = 'key';
        storageService.getItem(arg1);
        expect(storage.get).toHaveBeenCalledWith(arg1);
    });

    it('getItem method should return SUCESS', async () => {
        spyOn(storage, 'get').and
        .returnValue(new Promise((resolve) => {
            resolve('{"success":"SUCCESS"}');
        }));
        const arg1 = 'key';
        const expectedRes = { success: 'SUCCESS' };
        const res = await storageService.getItem(arg1);
        expect(res).toEqual(expectedRes);
    });

    it('removeItem method should exists', () => {
        const res = typeof storageService.removeItem === 'function';
        expect(res).toEqual(true);
    });

    it('setItem method should call Storage service with remove method', () => {
        spyOn(storage, 'remove');
        const arg1 = 'key';
        storageService.removeItem(arg1);
        expect(storage.remove).toHaveBeenCalledWith(arg1);
    });
});
