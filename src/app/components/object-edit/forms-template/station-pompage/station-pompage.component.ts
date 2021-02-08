import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/sliders/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-station-pompage',
  templateUrl: './station-pompage.component.html',
  styleUrls: ['./station-pompage.component.scss'],
})
export class StationPompageComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initReseauHydraulique();
    this.FT.initDamPosition();
    this.FT.initDamSide();
  }

  initReseauHydraulique() {
    this.EOS.setupRef('reseauHydrauliqueFermeIds', this.EOS.refs.ReseauHydrauliqueFerme[0], true);
  }

}
