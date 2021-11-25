import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { SirsDocService } from '../services/sirsdoc.service';

@Injectable({providedIn: 'root'})
export class SirsDocResolver implements Resolve<any> {
    constructor(private sirsDocService: SirsDocService) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return this.sirsDocService.init();
    }
}
