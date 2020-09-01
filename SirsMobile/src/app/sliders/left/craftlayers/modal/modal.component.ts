import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { colorFactory } from 'src/app/color-factory';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {

  colors = colorFactory.colors;

  selectedColor = null;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

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
    if (color === this.selectedColor) {
      return 'default';
    } else {
      return 'outline';
    }
  }

  validate() {
    if (this.selectedColor) {
      console.log(this.selectedColor);
      this.modalCtrl.dismiss(this.selectedColor);
    }
  }

}
