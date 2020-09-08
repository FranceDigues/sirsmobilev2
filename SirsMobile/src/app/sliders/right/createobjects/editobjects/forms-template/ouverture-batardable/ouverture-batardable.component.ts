import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

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
    this.initSeuil();
    this.initGlissiere();
    this.initOuvrageRevanche();
    this.initDamPosition();
    this.initDamSide();
  }

  initSeuil() {
    this.EOS.setupRef('typeSeuilId', this.EOS.refs.RefSeuil[0]);
  }

  initGlissiere() {
    this.EOS.setupRef('typeGlissiereId', this.EOS.refs.RefTypeGlissiere[0]);
  }

  initOuvrageRevanche() {
    this.EOS.setupRef('ouvrageRevancheIds', this.EOS.refs.OuvrageRevanche[0], true);
  }

  initDamPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initDamSide() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
