import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { EditionModeService } from "../services/edition-mode.service";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class RefTypesResolver implements Resolve<any> {
    constructor(private editionService: EditionModeService) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return this.editionService.getReferenceTypes();
    }
}
