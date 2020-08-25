import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppVersionsService {

    versions = null;

    constructor(private http: HttpClient) { }

    init() {
        this.http.get('../assets/versions.json')
        .subscribe(
            (data) => {
                this.versions = data;
            },
            (err) => {
                console.log('init err', err);
            }
        );
    }

    getVersions() {
        return this.versions;
    }
}
