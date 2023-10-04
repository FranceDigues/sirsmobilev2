import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';

@Component({
  selector: 'form-crete',
  templateUrl: './crete.component.html',
  styleUrls: ['./crete.component.scss'],
})
export class CreteComponent implements OnInit {

  constructor(private FT: FormsTemplateService, public EOS: EditObjectService) { }

  ngOnInit() {
    this.FT.initMaterial();
    this.FT.initNature();
    this.FT.initFunction();
    this.FT.initWidth();
  }
}
