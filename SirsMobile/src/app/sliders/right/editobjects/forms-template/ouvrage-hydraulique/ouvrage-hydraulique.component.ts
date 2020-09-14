import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-ouvrage-hydraulique',
  templateUrl: './ouvrage-hydraulique.component.html',
  styleUrls: ['./ouvrage-hydraulique.component.scss'],
})
export class OuvrageHydrauliqueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initTypeOuvrageHydroAssocieID();
    this.initReadeauHydrauliqueFerme();
    this.initPosition();
    this.initCote();
  }

  initTypeOuvrageHydroAssocieID() {
    this.EOS.setupRef('typeOuvrageHydroAssocieId', this.EOS.refs.RefOuvrageHydrauliqueAssocie[0]);
  }

  initReadeauHydrauliqueFerme() {
    this.EOS.setupRef('reseauHydrauliqueFermeIds', this.EOS.refs.ReseauHydrauliqueFerme[0], true);
  }

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);

  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
