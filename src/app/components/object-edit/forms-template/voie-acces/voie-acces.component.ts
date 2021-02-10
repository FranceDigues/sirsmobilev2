import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-voie-acces',
  templateUrl: './voie-acces.component.html',
  styleUrls: ['./voie-acces.component.scss'],
})
export class VoieAccesComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initWidth();
    this.FT.initMaterial();
    this.FT.initUsage();
    this.FT.initPosition();
    this.FT.initCote();
  }

}
