import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';
import { FormsTemplateService } from 'src/app/formstemplate.service';

@Component({
  selector: 'form-ouverture-batardable',
  templateUrl: './ouverture-batardable.component.html',
  styleUrls: ['./ouverture-batardable.component.scss'],
})
export class OuvertureBatardableComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
    this.EOS.objectDoc.hauteur = this.EOS.objectDoc.hauteur || 0;
    this.EOS.objectDoc.zSeuil = this.EOS.objectDoc.zSeuil || 0;
    this.FT.initSeuil();
    this.FT.initGlissiere();
    this.FT.initOuvrageRevanche();
    this.FT.initDamPosition();
    this.FT.initDamSide();
  }

}
