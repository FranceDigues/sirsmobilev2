import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-reseau-telecom-energie',
  templateUrl: './reseau-telecom-energie.component.html',
  styleUrls: ['./reseau-telecom-energie.component.scss'],
})
export class ReseauTelecomEnergieComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initNetworkType();
    this.initImplantation();
    this.initHeight();
    this.initOuvrageTelecomEnergie();
    this.initPosition();
    this.initCote();
  }

  initNetworkType() {
    this.EOS.setupRef('typeReseauTelecomEnergieId', this.EOS.refs.RefReseauTelecomEnergie[0]);
  }

  initImplantation() {
    this.EOS.setupRef('implantationId', this.EOS.refs.RefImplantation[0]);
  }

  initHeight() {
   this.EOS.objectDoc.hauteur =this.EOS.objectDoc.hauteur || 0;
  }

  initOuvrageTelecomEnergie() {
    this.EOS.setupRef('ouvrageTelecomEnergieIds', this.EOS.refs.OuvrageTelecomEnergie[0], true);
  }

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
