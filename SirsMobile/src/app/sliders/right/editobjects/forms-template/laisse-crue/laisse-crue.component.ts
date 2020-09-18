import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-laisse-crue',
  templateUrl: './laisse-crue.component.html',
  styleUrls: ['./laisse-crue.component.scss'],
})
export class LaisseCrueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initHeightRef();
    this.initHeight();
    this.initDamPosition();
    this.initDamSide();
  }

  initHeightRef() {
    this.EOS.setupRef('referenceHauteurId', this.EOS.refs.RefReferenceHauteur[0]);
  }

  initHeight() {
    this.EOS.objectDoc.hauteur = this.EOS.objectDoc.hauteur || 0;
  }

  initDamPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initDamSide() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
