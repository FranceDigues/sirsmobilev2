import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-media',
  templateUrl: './edit-media.component.html',
  styleUrls: ['./edit-media.component.scss'],
})
export class EditMediaComponent implements OnInit {

  public edited : boolean = false;
  public view: string = '';
  @Input() photo: any; // Pour récupérer la photo
  @Input() indexP: number; // Pour récupérer l'index
  constructor(private modalCtrl: ModalController) {
    
   }

  ngOnInit() {
    
  }

  closeModal() {
    this.modalCtrl.dismiss({view: 'detail'});
  }

  validate() {

    this.modalCtrl.dismiss({view: this.view, edited: this.edited});
  }
  
  getEdit($event: any) {
    this.edited = $event;
  }
  getView($event: any) {
    this.view = $event;
    this.validate();
  }




}
