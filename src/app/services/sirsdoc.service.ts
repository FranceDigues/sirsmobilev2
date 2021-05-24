import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';

@Injectable({
    providedIn: 'root',
})
export class SirsDocService {

    doc = null;

    constructor(private localDB: LocalDatabase) { }

    initializeDoc() {
        return new Promise((resolve) => {
            this.localDB.get('$sirs')
            .then(
                (result) => {
                    this.doc = result;
                    resolve(this.doc);
                }
            );
        });
    }

    get(): any {
        if (this.doc) {
            return this.doc;
        } else {
            this.localDB.get('$sirs')
            .then(
                (result) => {
                    this.doc = result;
                }
            )
            .catch(error => {
                console.error(error);
            });
        }
    }
}
