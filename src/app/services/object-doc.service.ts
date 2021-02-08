import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { EditionModeService } from './edition-mode.service';

@Injectable({
    providedIn: 'root'
})
export class ObjectDocService {

    constructor(private localDB: LocalDatabase, private editionService: EditionModeService) { }

    async getObjectDoc(type, id): Promise<any> {
        if (id && id !== '') {
            return this.localDB.get(id);
        } else {
            return this.localDB.create(this.editionService.newObject(type));
        }
    }
}
