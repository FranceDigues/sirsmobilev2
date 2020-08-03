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
    })

    beforeEach(() => {
        nativeStorageService = TestBed.inject(NativeStorageService);
        nativeStorage = TestBed.inject(NativeStorage);
    })

    it("setItem method should exists", () => {
        let res = typeof nativeStorageService.setItem === "function";
        expect(res).toEqual(true);
    })

    it("setItem method should call nativeStorage service with setItem method", () => {
        spyOn(nativeStorage, 'setItem');
        let arg1 = "key";
        let arg2 = { result: "SUCESS" }
        nativeStorageService.setItem(arg1, arg2);
        expect(nativeStorage.setItem).toHaveBeenCalledWith(arg1, arg2);
    })

    it("getItem method should exists", () => {
        let res = typeof nativeStorageService.getItem === "function";
        expect(res).toEqual(true);
    })

    it("getItem method should call nativeStorage service with getItem method", () => {
        spyOn(nativeStorage, 'getItem').and
        .returnValue(new Promise((resolve) => {
            resolve({ result: "SUCESS" })
        }));
        let arg = "key";

        nativeStorageService.getItem(arg);
        expect(nativeStorage.getItem).toHaveBeenCalledWith(arg);
    })

    it("getItem method should return { result: 'SUCESS' }", async () => {
        spyOn(nativeStorage, 'getItem').and
        .returnValue(new Promise((resolve) => {
            resolve({ result: "SUCESS" })
        }));
        let arg = "key";
        let expectedRes = { result: "SUCESS" }

        let res = await nativeStorageService.getItem(arg);
        expect(res).toEqual(expectedRes)
    })

    it("removeItem method should exists", () => {
        let res = typeof nativeStorageService.removeItem === "function";
        expect(res).toEqual(true);
    })

    it("removeItem method should call nativeStorage service with removeItem method", () => {
        spyOn(nativeStorage, 'remove');
        let arg = "key";
        nativeStorageService.removeItem(arg);
        expect(nativeStorage.remove).toHaveBeenCalledWith(arg);
    })

});
