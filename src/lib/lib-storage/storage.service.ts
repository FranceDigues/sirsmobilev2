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

    setItem(key: string, item): void {
        const jsonItem = JSON.stringify(item);
        this.storage.set(key, jsonItem);
    }

    async getItem(key: string): Promise<any> {
        let result = null;

        await this.storage.get(key)
        .then(
            (res) => {
                result = res;
            },
            (err) => {
                result = null;
            }
        );
        return (JSON.parse(result));
    }

    removeItem(key: string): void {
        this.storage.remove(key);
    }
}
