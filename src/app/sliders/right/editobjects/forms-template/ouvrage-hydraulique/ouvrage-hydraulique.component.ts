import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';
import { FormsTemplateService } from 'src/app/formstemplate.service';

@Component({
  selector: 'form-ouvrage-hydraulique',
  templateUrl: './ouvrage-hydraulique.component.html',
  styleUrls: ['./ouvrage-hydraulique.component.scss'],
})
export class OuvrageHydrauliqueComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initTypeOuvrageHydroAssocieID();
    this.initReadeauHydrauliqueFerme();
    this.FT.initPosition();
    this.FT.initCote();
  }

  initTypeOuvrageHydroAssocieID() {
    this.EOS.setupRef('typeOuvrageHydroAssocieId', this.EOS.refs.RefOuvrageHydrauliqueAssocie[0]);
  }

  initReadeauHydrauliqueFerme() {
    this.EOS.setupRef('reseauHydrauliqueFermeIds', this.EOS.refs.ReseauHydrauliqueFerme[0], true);
  }

}
