import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/sliders/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-reseau-telecom-energie',
  templateUrl: './reseau-telecom-energie.component.html',
  styleUrls: ['./reseau-telecom-energie.component.scss'],
})
export class ReseauTelecomEnergieComponent implements OnInit {

  constructor(public EOS: EditObjectService,  private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initNetworkType();
    this.initImplantation();
    this.FT.initHeight();
    this.initOuvrageTelecomEnergie();
    this.FT.initPosition();
    this.FT.initCote();
  }

  initNetworkType() {
    this.EOS.setupRef('typeReseauTelecomEnergieId', this.EOS.refs.RefReseauTelecomEnergie[0]);
  }

  initImplantation() {
    this.EOS.setupRef('implantationId', this.EOS.refs.RefImplantation[0]);
  }

  initOuvrageTelecomEnergie() {
    this.EOS.setupRef('ouvrageTelecomEnergieIds', this.EOS.refs.OuvrageTelecomEnergie[0], true);
  }

}
