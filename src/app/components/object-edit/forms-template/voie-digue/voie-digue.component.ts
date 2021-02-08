import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { FormsTemplateService } from 'src/app/sliders/formstemplate.service';

@Component({
  selector: 'form-voie-digue',
  templateUrl: './voie-digue.component.html',
  styleUrls: ['./voie-digue.component.scss'],
})
export class VoieDigueComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initWidth();
    this.initType();
    this.initCoating();
    this.FT.initUsage();
    this.FT.initPosition();
    this.FT.initCote();
  }

  initType() {
    this.EOS.setupRef('typeVoieDigueId', this.EOS.refs.RefVoieDigue[0]);
  }

  initCoating() {
    this.EOS.setupRef('revetementId', this.EOS.refs.RefRevetement[0]);
  }

}
