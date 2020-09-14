import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-voie-acces',
  templateUrl: './voie-acces.component.html',
  styleUrls: ['./voie-acces.component.scss'],
})
export class VoieAccesComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initWidth();
    this.initMaterial();
    this.initUsage();
    this.initPosition();
    this.initCoteID();
  }

  initWidth() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
  }

  initMaterial() {
    this.EOS.setupRef('materiauId', this.EOS.refs.RefMateriau[0]);
  }

  initUsage() {
    this.EOS.setupRef('usageId', this.EOS.refs.RefUsageVoie[0]);
  }

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initCoteID() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
