import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';

@Injectable({
    providedIn: 'root',
})
export class SirsDocService {

    /*
    Ce service est deprecated
     */

    doc = null;

    constructor(private localDB: LocalDatabase) {}

    get() {
        return this.doc;
    }

    init() {
        if (this.doc) {
            return new Promise((resolve) => {
                resolve(this.doc);
            });
        } else {
            return new Promise((resolve, reject) => {
                this.localDB.get('$sirs').then(
                    (doc) => {
                        this.doc = doc;
                        resolve(doc);
                    },
                    (error) => {
                        console.error('SirsDocService get error : ', error);
                        reject(error);
                    }
                );
            });
        }
    }
}
