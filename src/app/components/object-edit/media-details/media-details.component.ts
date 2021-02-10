import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-media-details',
    templateUrl: './media-details.component.html',
    styleUrls: ['./media-details.component.scss'],
})
export class MediaDetailsComponent implements OnInit {
    @Input() photos: Array<any>;
    @Input() objectDoc;
    @Output() changeView = new EventEmitter<string>();

    constructor(private toastCtrl: ToastController) {
    }

    ngOnInit() {
    }

    openMediaForm() {
        this.changeView.emit('media');
    }

    removePhoto(photo) {
        const index = this.photos.findIndex(item => item.id === photo.id);
        if (index > -1) {
            this.photos.splice(index, 1);
        } else {
            this.toastCtrl.create({
                message: 'Impossible de supprimer cette photo',
                duration: 3000
            }).then(toast => toast.present());
        }
    }

}
