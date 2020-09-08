import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-crete',
  templateUrl: './crete.component.html',
  styleUrls: ['./crete.component.scss'],
})
export class CreteComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initMaterial();
    this.initNatute();
    this.initFunction();
    this.initWidth();
  }

  initMaterial() {
    this.EOS.setupRef('materiauId', this.EOS.refs.RefMateriau[0]);
  }

  initNatute() {
    this.EOS.setupRef('natureId', this.EOS.refs.RefNature[0]);
  }

  initFunction() {
    this.EOS.setupRef('fonctionId', this.EOS.refs.RefFonction[0]);
  }

  initWidth() {
    this.EOS.objectDoc.epaisseur = this.EOS.objectDoc.epaisseur || 0
  }
}
