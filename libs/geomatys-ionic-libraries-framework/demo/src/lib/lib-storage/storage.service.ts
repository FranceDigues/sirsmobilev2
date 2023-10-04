import { Injectable } from '@angular/core';
import { ClassStorageService } from './class.service';
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService extends ClassStorageService {

    constructor(private storage: Storage) {
        super();
    }

    setItem(key: string, item: object | Array<any>): void {
        const object = JSON.stringify(item);
        this.storage.set(key, object);
    }

    async getItem(key: string): Promise<object | Array<any>> {
        let result = null;

        await this.storage.get(key)
        .then(
            (res) => {
                result = res;
            },
            (err) => {
                result = err;
            }
        );
        return (JSON.parse(result));
    }

    removeItem(key: string): void {
        this.storage.remove(key);
    }
}
