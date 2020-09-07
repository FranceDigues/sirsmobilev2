import { Injectable } from '@angular/core';
import { LocalDatabase } from './usingLocalDatabase.service';
import { EditionModeService } from './editionmode.service';


@Injectable({
    providedIn: 'root'
})
export class ObjectDocService {

    constructor(private localDB: LocalDatabase, private editionService: EditionModeService) { }

    async getObjectDoc(routeParams): Promise<any> {
        if (routeParams.id && routeParams.id !== '') {
            return this.localDB.get(routeParams.id);
        } else {
            return this.localDB.create(this.editionService.newObject(routeParams.type));
        }
    }
}
