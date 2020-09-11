import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../../editobjects.service';

@Component({
  selector: 'form-station-pompage',
  templateUrl: './station-pompage.component.html',
  styleUrls: ['./station-pompage.component.scss'],
})
export class StationPompageComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initReseauHydraulique();
    this.initDamPosition();
    this.initDamSide();
  }

  initReseauHydraulique() {
    this.EOS.setupRef('reseauHydrauliqueFermeIds', this.EOS.refs.ReseauHydrauliqueFerme[0], true);
  }

  initDamPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initDamSide() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
