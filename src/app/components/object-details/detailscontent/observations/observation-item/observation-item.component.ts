import { Component, Input, OnInit } from '@angular/core';
import { ObjectDetails } from "../../../../../services/object-details.service";
import { File } from "@ionic-native/file/ngx";

@Component({
    selector: 'app-observation-item',
    templateUrl: './observation-item.component.html',
    styleUrls: ['./observation-item.component.scss'],
})
export class ObservationItemComponent implements OnInit {
    @Input() observation;
    @Input() selectedObject;
    hasPhoto$: Promise<boolean>;
    mediaPath;
    loading;

    constructor(public detailsObject: ObjectDetails,
                private file: File) {
    }

    ngOnInit(): void {
        this.loading = true;
        this.mediaPath = `${this.file.dataDirectory}medias/`;

        this.hasPhoto$ = new Promise<boolean>(async (resolve) => {
            if (this.observation.photos && this.observation.photos.length > 0) {
                for (let i = 0; i < this.observation.photos.length; i++) {
                    if (this.selectedObject['_attachments'] && this.selectedObject['_attachments'][this.observation.photos[i].id]) {
                        this.loading = false;
                        resolve(true);
                    } else {
                        let fileName = `${this.observation.photos[i].id}.jpg`;
                        const find = await this.file.checkFile(this.mediaPath, fileName);
                        if (find) {
                            this.loading = false;
                            resolve(true);
                        }
                    }
                }
                this.loading = false;
                resolve(false);
            } else {
                this.loading = false;
                resolve(false);
            }
        });
    }


}
