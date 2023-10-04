import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class AppVersionsService {
    versions = null;

    constructor(private http: HttpClient, private platform: Platform) {
    }

    getVersions() {
        return new Promise((resolve, reject) => {
            if (this.versions) {
                resolve(this.versions);
            } else {
                this.http.get(this.platform.is('android') ? '../assets/android-versions.json' : '../assets/ios-versions.json')
                    .subscribe(
                        (data) => {
                            this.versions = data;
                            resolve(this.versions);
                        },
                        (err) => {
                            reject(err);
                        }
                    );
            }
        });
    }
}
