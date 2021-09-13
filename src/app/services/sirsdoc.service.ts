import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';

@Injectable({
    providedIn: 'root',
})
export class SirsDocService {

    doc = null;

    constructor(private localDB: LocalDatabase) { }

    initializeDoc() {
        return new Promise((resolve, reject) => {
            this.localDB.get('$sirs')
            .then(
                (result) => {
                    this.doc = result;
                    resolve(this.doc);
                }
            )
            .catch(error => {
                reject(error);
            });
        });
    }

    get(): any {
        if (this.doc) {
            return this.doc;
        } else {
            this.initializeDoc()
            .then((doc) => {
                return doc;
            })
            .catch(error => {
                console.error("SirsDocService get error : ", error);
                return null;
            })
        }
    }
}
