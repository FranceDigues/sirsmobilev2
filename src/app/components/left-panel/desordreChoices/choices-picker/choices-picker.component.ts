import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {getLegendByRefId, MapManagerService, UrgenceLayerColors} from 'src/app/services/map-manager.service';
import { getColorByRefId } from 'src/app/services/map-manager.service';

@Component({
  selector: 'app-choices-picker',
  templateUrl: './choices-picker.component.html',
  styleUrls: ['./choices-picker.component.scss'],
})
export class ChoicesPickerComponent implements OnInit {
  public urgencyLevels = Object.values(this.mapManagerService.getUrgenceLayerColors());
  //public urgencyLevels = Object.values(UrgenceLayerColors) ;
  public selectedDesordreType: string []= [];
  constructor(private modalCtrl: ModalController, 
              public mapManagerService: MapManagerService) { }

  ngOnInit() {
   
  }

  closeModal() {
    this.mapManagerService.updateIsDiplayingUrgence(false);
    this.modalCtrl.dismiss(null);
  }

  validate() {
    if (this.selectedDesordreType.length > 0) {
        this.modalCtrl.dismiss(this.selectedDesordreType);
    }
  }
  public selectUrgency(urgency){
    const index = this.selectedDesordreType.indexOf(urgency);
    if (index > -1) {
        this.selectedDesordreType.splice(index, 1);
    } else {
        this.selectedDesordreType.push(urgency);
    }
  }
  public getColor(urgence: string){
    const rgba : number[] = getColorByRefId(urgence);
    const val = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
  }
  public ifSelected(urgency){
    return (this.selectedDesordreType?.includes(urgency));
  }

  selectAllUrgencies() {
    if (this.isAllSelected()) {
        this.selectedDesordreType = [];
    } else {
      this.selectedDesordreType = [];
      Object.entries(UrgenceLayerColors).forEach(([key, value]) => {
        this.selectedDesordreType.push(value);
    });
     
    }
  }

  isAllSelected() {
      return this.urgencyLevels.length === this.selectedDesordreType.length;
  }

  public getLegendeLibelle(urgence: string){
    return getLegendByRefId(urgence);
  }


}
