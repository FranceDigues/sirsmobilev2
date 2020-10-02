import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/formstemplate.service';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-reseau-hydraulique-ferme',
  templateUrl: './reseau-hydraulique-ferme.component.html',
  styleUrls: ['./reseau-hydraulique-ferme.component.scss'],
})
export class ReseauHydrauliqueFermeComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initDiameter();
    this.initAllowed();
    this.initFlow();
    this.initImplantation();
    this.initNetworkType();
    this.initUtilisation();
    this.FT.initPosition();
    this.FT.initCote();
  }

  initDiameter() {
    this.EOS.objectDoc.diametre = this.EOS.objectDoc.diametre || 0;
  }

  initAllowed() {
    this.EOS.objectDoc.autorise = true;
  }

  initFlow() {
    this.EOS.setupRef('ecoulementId', this.EOS.refs.RefEcoulement[0]);
  }

  initImplantation() {
    this.EOS.setupRef('implantationId', this.EOS.refs.RefImplantation[0]);
  }

  initNetworkType() {
    this.EOS.setupRef('typeConduiteFermeeId', this.EOS.refs.RefConduiteFermee[0]);
  }

  initUtilisation() {
    this.EOS.setupRef('utilisationConduiteId', this.EOS.refs.RefUtilisationConduite[0]);
  }

}
