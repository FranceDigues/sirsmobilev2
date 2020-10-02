import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/formstemplate.service';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-ouvrage-voirie',
  templateUrl: './ouvrage-voirie.component.html',
  styleUrls: ['./ouvrage-voirie.component.scss'],
})
export class OuvrageVoirieComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initTypeOuvrageVoirie();
    this.FT.initPosition();
    this.FT.initCote();
  }

  initTypeOuvrageVoirie() {
    this.EOS.setupRef('typeOuvrageVoirieId', this.EOS.refs.RefOuvrageVoirie[0]);
  }

}
