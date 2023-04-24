import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-ouvrage-telecom-energie',
  templateUrl: './ouvrage-telecom-energie.component.html',
  styleUrls: ['./ouvrage-telecom-energie.component.scss'],
})
export class OuvrageTelecomEnergieComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initTypeOuvrageTelecomEnergie();
    this.initReseauTelecomEnergie();
    this.initSecuriteId();
    this.FT.initPosition();
    this.FT.initCote();
  }

  initTypeOuvrageTelecomEnergie() {
    this.EOS.setupRef('typeOuvrageTelecomEnergieId', this.EOS.refs.RefOuvrageTelecomEnergie[0]);
  }

  initReseauTelecomEnergie() {
    this.EOS.setupRef('reseauTelecomEnergieIds', this.EOS.refs.ReseauTelecomEnergie[0], true);
  }

  initSecuriteId() {
    this.EOS.setupRef('securiteId', this.EOS.refs.RefSecurite[0]);
  }
}
