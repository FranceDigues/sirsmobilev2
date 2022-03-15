import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { LabelService } from 'src/app/services/label.service';

@Component({
  selector: 'form-ouvrage-particulier',
  templateUrl: './ouvrage-particulier.component.html',
  styleUrls: ['./ouvrage-particulier.component.scss'],
})
export class OuvrageParticulierComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService, private labelService: LabelService) { }

  ngOnInit() {
    this.initTypeOuvrageParticulier();
    this.initSecuriteId();
    this.FT.initDamPosition();
    this.FT.initDamSide();
  }

  initTypeOuvrageParticulier() {
    this.EOS.setupRef('typeOuvrageParticulierId', this.EOS.refs.RefOuvrageParticulier[0]);
  }

  initSecuriteId() {
    this.EOS.setupRef('securiteId', this.EOS.refs.RefSecurite[0]);
  }
}
