import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class AppVersionsService {

    versions = null;

    constructor(private http: HttpClient, private platform: Platform) { }

    init() {
        if (this.platform.is('android')) {
            this.http.get('../assets/android-versions.json')
            .subscribe(
                (data) => {
                    this.versions = data;
                },
                (err) => {
                    console.error('init err', err);
                }
            );
        } else {
            this.http.get('../assets/ios-versions.json')
            .subscribe(
                (data) => {
                    this.versions = data;
                },
                (err) => {
                    console.error('init err', err);
                }
            );
        }
    }

    getVersions() {
        return this.versions;
    }
}
