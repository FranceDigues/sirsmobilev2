import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/editobjects.service';
import { FormsTemplateService } from 'src/app/sliders/formstemplate.service';

@Component({
  selector: 'form-laisse-crue',
  templateUrl: './laisse-crue.component.html',
  styleUrls: ['./laisse-crue.component.scss'],
})
export class LaisseCrueComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initHeightRef();
    this.initHeight();
    this.FT.initDamPosition();
    this.FT.initDamSide();
  }

  initHeight() {
    this.EOS.objectDoc.hauteur = this.EOS.objectDoc.hauteur || 0;
  }

}
