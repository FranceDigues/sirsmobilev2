import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../../editobjects.service';

@Component({
  selector: 'form-ouvrage-revanche',
  templateUrl: './ouvrage-revanche.component.html',
  styleUrls: ['./ouvrage-revanche.component.scss'],
})
export class OuvrageRevancheComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initMateriauHaut();
    this.initMateriauBas();
    this.initNatureHaut();
    this.initNatureBas();
    this.initHeight();
    this.initWidth();
    this.initDamPosition();
    this.initDamSide();
  }

  initMateriauHaut() {
    this.EOS.setupRef('materiauHautId', this.EOS.refs.RefMateriau[0]);
  }

  initMateriauBas() {
    this.EOS.setupRef('materiauBasId', this.EOS.refs.RefMateriau[0]);
  }

  initNatureHaut() {
    this.EOS.setupRef('natureHautId', this.EOS.refs.RefNature[0]);
  }

  initNatureBas() {
    this.EOS.setupRef('natureBasId', this.EOS.refs.RefNature[0]);
  }

  initHeight() {
    this.EOS.objectDoc.hauteurMurette = this.EOS.objectDoc.hauteurMurette || 0;
  }

  initWidth() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
  }

  initDamPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initDamSide() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
