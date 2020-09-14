import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-reseau-hydraulique-ferme',
  templateUrl: './reseau-hydraulique-ferme.component.html',
  styleUrls: ['./reseau-hydraulique-ferme.component.scss'],
})
export class ReseauHydrauliqueFermeComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initDiameter();
    this.initAllowed();
    this.initFlow();
    this.initImplantation();
    this.initNetworkType();
    this.initUtilisation();
    this.initPosition();
    this.initCote();
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

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
