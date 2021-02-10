import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';

@Component({
  selector: 'form-sommet-risberme',
  templateUrl: './sommet-risberme.component.html',
  styleUrls: ['./sommet-risberme.component.scss'],
})
export class SommetRisbermeComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initMaterial();
    this.FT.initNature();
    this.FT.initFunction();
    this.FT.initWidth();
    this.FT.initCote();
  }

}
