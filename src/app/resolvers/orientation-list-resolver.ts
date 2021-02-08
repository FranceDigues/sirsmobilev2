import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { LocalDatabase } from "../services/local-database.service";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class OrientationListResolver implements Resolve<any> {
    constructor(private localDocument: LocalDatabase) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return this.localDocument.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.RefOrientationPhoto'],
            endkey: ['fr.sirs.core.model.RefOrientationPhoto', {}]
        });
    }
}
