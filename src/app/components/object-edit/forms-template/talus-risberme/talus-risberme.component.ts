import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-talus-risberme',
  templateUrl: './talus-risberme.component.html',
  styleUrls: ['./talus-risberme.component.scss'],
})
export class TalusRisbermeComponent implements OnInit {

  constructor(private FT: FormsTemplateService, public EOS: EditObjectService) { }

  ngOnInit() {
    this.FT.initTalus();
  }

}
