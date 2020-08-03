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

    setItem(key: string, item: string): void {
        this.storage.set(key, item);
    }

    async getItem(key: string): Promise<string> {
        let result = null;

        await this.storage.get(key)
        .then(
            (res) => {
                result = res;
            },
            (err) => {
                result = err;
            }
        )
        return (result);
    }

    removeItem(key: string): void {
        this.storage.remove(key);
    }
}
