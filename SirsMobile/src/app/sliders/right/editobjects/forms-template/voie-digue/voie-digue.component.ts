import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-voie-digue',
  templateUrl: './voie-digue.component.html',
  styleUrls: ['./voie-digue.component.scss'],
})
export class VoieDigueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initWidth();
    this.initType();
    this.initCoating();
    this.initUsage();
    this.initPosition();
    this.initCote();
  }

  initWidth() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
  }

  initType() {
    this.EOS.setupRef('typeVoieDigueId', this.EOS.refs.RefVoieDigue[0]);
  }

  initCoating() {
    this.EOS.setupRef('revetementId', this.EOS.refs.RefRevetement[0]);
  }

  initUsage() {
    this.EOS.setupRef('usageId', this.EOS.refs.RefUsageVoie[0]);
  }

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
