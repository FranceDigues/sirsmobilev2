import { Injectable } from '@angular/core';
import { LocalDatabase } from './usingLocalDatabase.service';


@Injectable({
providedIn: 'root',
})
export class SirsDocService {

    doc = null;

    constructor(private localDB: LocalDatabase) { }

    get() {
        if (this.doc) {
            return this.doc;
        } else {
            return this.localDB.get('$sirs')
            .then(
                (result) => {
                    this.doc = result;
                    return result;
                }
            )
        }
    }
}