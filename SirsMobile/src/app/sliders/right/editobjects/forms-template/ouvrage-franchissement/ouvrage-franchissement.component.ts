import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-ouvrage-franchissement',
  templateUrl: './ouvrage-franchissement.component.html',
  styleUrls: ['./ouvrage-franchissement.component.scss'],
})
export class OuvrageFranchissementComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
    this.initOrientationOuvrage();
    this.initUsage();
    this.initRevetementHaut();
    this.initRevetementBas();
    this.initTypeOuvrage();
    this.initPositionHaut();
    this.initPositionBas();
    this.initCoteID();
  }

  initOrientationOuvrage() {
    this.EOS.setupRef('orientationOuvrageId', this.EOS.refs.RefOrientationOuvrage[0]);
  }

  initUsage() {
    this.EOS.setupRef('usageId', this.EOS.refs.RefUsageVoie[0]);
  }

  initRevetementHaut() {
    this.EOS.setupRef('revetementHautId', this.EOS.refs.RefRevetement[0]);
  }

  initRevetementBas() {
    this.EOS.setupRef('revetementBasId', this.EOS.refs.RefRevetement[0]);
  }

  initTypeOuvrage() {
    this.EOS.setupRef('typeOuvrageFranchissementId', this.EOS.refs.RefOuvrageFranchissement[0]);
  }

  initPositionHaut() {
    this.EOS.setupRef('positionHautId', this.EOS.refs.RefPosition[0]);
  }

  initPositionBas() {
    this.EOS.setupRef('positionBasId', this.EOS.refs.RefPosition[0]);
  }

  initCoteID() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
