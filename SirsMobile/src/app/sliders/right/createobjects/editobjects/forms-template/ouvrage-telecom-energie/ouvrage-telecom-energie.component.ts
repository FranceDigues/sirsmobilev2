import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../../editobjects.service';

@Component({
  selector: 'form-ouvrage-telecom-energie',
  templateUrl: './ouvrage-telecom-energie.component.html',
  styleUrls: ['./ouvrage-telecom-energie.component.scss'],
})
export class OuvrageTelecomEnergieComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initTypeOuvrageTelecomEnergie();
    this.initReseauTelecomEnergie();
    this.initPosition();
    this.initCode();
  }

  initTypeOuvrageTelecomEnergie() {
    this.EOS.setupRef('typeOuvrageTelecomEnergieId', this.EOS.refs.RefOuvrageTelecomEnergie[0]);
  }

  initReseauTelecomEnergie() {
    this.EOS.setupRef('reseauTelecomEnergieIds', this.EOS.refs.ReseauTelecomEnergie[0], true);
  }

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initCode() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
