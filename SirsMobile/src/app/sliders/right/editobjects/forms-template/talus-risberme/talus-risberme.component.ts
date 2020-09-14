import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-talus-risberme',
  templateUrl: './talus-risberme.component.html',
  styleUrls: ['./talus-risberme.component.scss'],
})
export class TalusRisbermeComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initMateriauHaut();
    this.initMateriauBas();
    this.initNatureHaut();
    this.initNatureBas();
    this.initTopThickness();
    this.initInnerSlope();
    this.initTopLength();
    this.initLowLength();
    this.initTopFunction();
    this.initLowFunction();
    this.initCote();
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

  initTopThickness() {
    this.EOS.objectDoc.epaisseurSommet = this.EOS.objectDoc.epaisseurSommet || 0;
  }

  initInnerSlope() {
    this.EOS.objectDoc.penteInterieure = this.EOS.objectDoc.penteInterieure || 0;
  }

  initTopLength() {
    this.EOS.objectDoc.longueurRampantHaut = this.EOS.objectDoc.longueurRampantHaut || 0;
  }

  initLowLength() {
    this.EOS.objectDoc.longueurRampantBas = this.EOS.objectDoc.longueurRampantBas || 0;
  }

  initTopFunction() {
    this.EOS.setupRef('fonctionHautId', this.EOS.refs.RefFonction[0]);
  }

  initLowFunction() {
    this.EOS.setupRef('fonctionBasId', this.EOS.refs.RefFonction[0]);
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
