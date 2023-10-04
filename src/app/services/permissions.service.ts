import { Injectable } from '@angular/core';
import { Diagnostic } from "@ionic-native/diagnostic/ngx";

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    constructor(private diagnostic: Diagnostic) {
    }

    async handleCameraPermissions() {
        const message = 'You have the Permission';
        if (window['device'] && Number(window['device'].version) < 13) {
            try {
                const status = await this.diagnostic.requestRuntimePermission(this.diagnostic.permission.READ_EXTERNAL_STORAGE);

                if (status !== this.diagnostic.permissionStatus.GRANTED) {
                    await this.diagnostic.getPermissionAuthorizationStatus(this.diagnostic.permission.READ_EXTERNAL_STORAGE);
                    return message;
                }
                return message;
            } catch (error) {
                console.error("The following error occurred: " + error);
            }
        } else {
            return message;
        }
    }
}
