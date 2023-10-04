import { Injectable } from '@angular/core';
import { ClassStorageService } from './class.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable({
    providedIn: 'root'
})
export class NativeStorageService extends ClassStorageService {

    constructor(private nativeStorage: NativeStorage) {
        super();
    }

    setItem(key: string, item: object): void {
        this.nativeStorage.setItem(key, item);
    }

    async getItem(key: string): Promise<object> {
        let result = null;

        await this.nativeStorage.getItem(key)
            .then(res => {
                result = res;
            })
            .catch(err => {
                result = {error: err};
            });
        return (result);
    }

    removeItem(key: string): void {
        this.nativeStorage.remove(key);
    }
}
