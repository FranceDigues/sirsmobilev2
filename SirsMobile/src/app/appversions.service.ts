import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppVersionsService {

    versions = null;

    constructor(private http: HttpClient) { }

    getVersions() {
        return new Promise((resolve) => {
            if (!this.versions) {
                this.http.get('../assets/versions.json')
                .subscribe(
                    (data) => {
                        this.versions = data;
                        resolve(this.versions);
                    },
                    (err) => {
                        console.log('err', err);
                    }
                );
            } else {
                resolve(this.versions);
            }
        })
    }
}
