import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/formstemplate.service';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-pied-digue',
  templateUrl: './pied-digue.component.html',
  styleUrls: ['./pied-digue.component.scss'],
})
export class PiedDigueComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initMaterial();
    this.FT.initNature();
    this.FT.initFunction();
    this.FT.initCote();
  }

}
