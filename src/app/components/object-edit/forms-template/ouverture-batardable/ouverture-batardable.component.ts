import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-ouverture-batardable',
  templateUrl: './ouverture-batardable.component.html',
  styleUrls: ['./ouverture-batardable.component.scss'],
})
export class OuvertureBatardableComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
    this.EOS.objectDoc.hauteur = this.EOS.objectDoc.hauteur || 0;
    this.EOS.objectDoc.zSeuil = this.EOS.objectDoc.zSeuil || 0;
  }

}
