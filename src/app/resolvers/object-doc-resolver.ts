import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { LocalDatabase } from '../services/local-database.service';
import { EditionModeService } from '../services/edition-mode.service';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ObjectDocResolver implements Resolve<any> {
    constructor(private localDocument: LocalDatabase,
                private editionService: EditionModeService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        const id = route.paramMap.get('id');
        const type = route.paramMap.get('type');
        if (id && id !== '') {
            return this.localDocument.get(id);
        } else {
            return this.localDocument.create(this.editionService.newObject(type));
        }
    }
}
