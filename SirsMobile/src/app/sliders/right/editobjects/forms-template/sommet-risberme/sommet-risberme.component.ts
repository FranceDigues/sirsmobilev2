import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-sommet-risberme',
  templateUrl: './sommet-risberme.component.html',
  styleUrls: ['./sommet-risberme.component.scss'],
})
export class SommetRisbermeComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initMaterial();
    this.initNatute();
    this.initFunction();
    this.initWidth();
    this.initCote();
  }

  initMaterial() {
    this.EOS.setupRef('materiauId', this.EOS.refs.RefMateriau[0]);
  }

  initNatute() {
    this.EOS.setupRef('natureId', this.EOS.refs.RefNature[0]);
  }

  initFunction() {
    console.log('setup fonction Id');
    this.EOS.setupRef('fonctionId', this.EOS.refs.RefFonction[0]);
  }

  initWidth() {
    this.EOS.objectDoc.epaisseur = this.EOS.objectDoc.epaisseur || 0
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
