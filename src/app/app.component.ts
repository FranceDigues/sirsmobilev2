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

    }
}
