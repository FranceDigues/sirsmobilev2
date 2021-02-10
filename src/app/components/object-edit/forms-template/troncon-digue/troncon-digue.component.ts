import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-troncon-digue',
  templateUrl: './troncon-digue.component.html',
  styleUrls: ['./troncon-digue.component.scss'],
})
export class TronconDigueComponent implements OnInit {

  constructor(public EOS: EditObjectService,  private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initCote();
  }

}
