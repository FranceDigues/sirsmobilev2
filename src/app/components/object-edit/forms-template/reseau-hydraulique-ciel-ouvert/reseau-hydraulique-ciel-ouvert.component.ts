import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-reseau-hydraulique-ciel-ouvert',
  templateUrl: './reseau-hydraulique-ciel-ouvert.component.html',
  styleUrls: ['./reseau-hydraulique-ciel-ouvert.component.scss'],
})
export class ReseauHydrauliqueCielOuvertComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initTypeReseauHydroCielOuvert();
    this.initReseauHydrauliqueFerme();
    this.FT.initPosition();
    this.FT.initCote();
  }

  initTypeReseauHydroCielOuvert() {
    this.EOS.setupRef('typeReseauHydroCielOuvertId', this.EOS.refs.RefReseauHydroCielOuvert[0]);
  }

  initReseauHydrauliqueFerme() {
    this.EOS.setupRef('reseauHydrauliqueFermeIds', this.EOS.refs.ReseauHydrauliqueFerme[0], true);
  }

}
