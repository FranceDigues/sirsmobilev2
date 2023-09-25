import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

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
  }

  initDiameter() {
    this.EOS.objectDoc.diametre = this.EOS.objectDoc.diametre || 0;
  }

  initAllowed() {
    this.EOS.objectDoc.autorise = true;
  }

}
