import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-ouvrage-revanche',
  templateUrl: './ouvrage-revanche.component.html',
  styleUrls: ['./ouvrage-revanche.component.scss'],
})
export class OuvrageRevancheComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initMateriauHaut();
    this.FT.initMateriauBas();
    this.FT.initNatureHaut();
    this.FT.initNatureBas();
    this.FT.initHeight();
    this.FT.initWidth();
    this.FT.initDamPosition();
    this.FT.initDamSide();
  }

}
