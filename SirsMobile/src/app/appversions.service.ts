import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppVersionsService {

    versions = null;

    constructor(private http: HttpClient) { }

    getVersions() {
        if (!this.versions) {
            return this.http.get('../assets/versions.json')
            .subscribe(
                (data) => {
                    this.versions = data;
                    return this.versions
                },
                (err) => {
                    console.log('err', err);
                }
            );
        } else {
            return this.versions;
        }
    }
}