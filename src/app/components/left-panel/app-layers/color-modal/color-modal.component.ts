import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { colorFactory } from 'src/app/utils/color-factory';


@Component({
    selector: 'app-modal',
    templateUrl: './color-modal.component.html',
    styleUrls: ['./color-modal.component.scss'],
})
export class ColorModalComponent implements OnInit {

    colors = colorFactory.colors;

    selectedColor = null;

    constructor(private modalCtrl: ModalController) {
    }

    ngOnInit() {
    }

    closeModal() {
        this.modalCtrl.dismiss(null);
    }

    calculateBackGroundColor(color) {
        return color.hex;
    }

    selectColor(color) {
        this.selectedColor = color;
    }

    ifSelected(color) {
        return color === this.selectedColor;
    }

    validate() {
        if (this.selectedColor) {
            this.modalCtrl.dismiss(this.selectedColor);
        }
    }

}
