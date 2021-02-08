import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-media-details',
    templateUrl: './media-details.component.html',
    styleUrls: ['./media-details.component.scss'],
})
export class MediaDetailsComponent implements OnInit {
    @Input() photos: Array<any>;
    @Output() changeView = new EventEmitter<string>();

    constructor() {
    }

    ngOnInit() {
    }

    openMediaForm() {
        this.changeView.emit('media');
    }

    openPhoto() {

    }

    getPhotoPath(photo) {

    }

    removePhoto(photo, index) {

    }

}
