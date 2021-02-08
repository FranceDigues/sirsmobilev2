import { Component, OnInit } from '@angular/core';

import { Toast } from '@ionic-native/toast/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

    constructor(private toast: Toast, private file: File, public platform: Platform) {
    }

    ngOnInit() {
        this.platform.ready().then((readySource) => {
            // Check if Media directory exist.
            this.file.checkDir(this.file.dataDirectory, 'medias')
                .then(() => {
                    },
                    (error) => {
                        // Create Media directory
                        this.file.createDir(this.file.dataDirectory, 'medias', false);
                        this.file.createFile(`${this.file.dataDirectory}medias/`, '_keepOpen', false);
                    });
            // Check if Document directory exist.
            this.file.checkDir(this.file.dataDirectory, 'documents')
                .then(() => {
                    },
                    () => {
                        // Create Document directory
                        this.file.createDir(this.file.dataDirectory, 'documents', false);
                        this.file.createFile(`${this.file.dataDirectory}documents/`, '_keepOpen', false);
                    });

        });


        //  // Add a handler for cordova event types
        // // $ionicPlatform.on();
        //
        // /** Add listener to the pause event
        //  * The pause event fires when the native platform puts the application into the background,
        //  * typically when the user switches to a different application.
        //  */
        //
        // // add an Event listener for the online/offline events
        //
        // var offlineHandler = function () {
        //     $rootScope.$apply(function () {
        //         $rootScope.online = false;
        //         $cordovaToast
        //             .showLongTop('La connexion est échoué');
        //     });
        // };
        //
        // var onlineHandler = function () {
        //     $rootScope.$apply(function () {
        //         $rootScope.online = true;
        //         $cordovaToast
        //             .showLongTop('Connexion établie avec succès');
        //     });
        // };
        //
        // $rootScope.online = navigator.onLine;
        //
        // $window.addEventListener("offline", offlineHandler, false);
        //
        // $window.addEventListener("online", onlineHandler, false);
        //
        // $ionicPlatform.on("pause", function (event) {
        //     $rootScope.online = undefined;
        //     $window.removeEventListener("offline", offlineHandler, false);
        //     $window.removeEventListener("online", onlineHandler, false);
        // });
        //
        // $ionicPlatform.on("resume", function (event) {
        //     $rootScope.online = navigator.onLine;
        //     $window.addEventListener("offline", offlineHandler, false);
        //     $window.addEventListener("online", onlineHandler, false);
        // });
        //
        // //Handle the Hardware BackButton
        // $ionicPlatform.onHardwareBackButton(function (event) {
        //     $rootScope.online = undefined;
        //     $window.removeEventListener("offline", offlineHandler, false);
        //     $window.removeEventListener("online", onlineHandler, false);
        // });

    }
}
