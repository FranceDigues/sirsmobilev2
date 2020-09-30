import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-pied-digue',
  templateUrl: './pied-digue.component.html',
  styleUrls: ['./pied-digue.component.scss'],
})
export class PiedDigueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initMateriau();
    this.initNature();
    this.initFonction();
    this.initCote();
  }

  initMateriau() {
    this.EOS.setupRef('materiauId', this.EOS.refs.RefMateriau[0]);
  }

  initNature() {
    this.EOS.setupRef('natureId', this.EOS.refs.RefNature[0]);
  }

  initFonction() {
    this.EOS.setupRef('fonctionId', this.EOS.refs.RefFonction[0]);
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
