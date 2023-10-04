import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-talus-digue',
  templateUrl: './talus-digue.component.html',
  styleUrls: ['./talus-digue.component.scss'],
})
export class TalusDigueComponent implements OnInit {

  constructor(private FT: FormsTemplateService, public EOS: EditObjectService) { }

  ngOnInit() {
    this.FT.initTalus();
  }

}
