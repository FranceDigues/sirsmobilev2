import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../../editobjects.service';

@Component({
  selector: 'form-ouvrage-voirie',
  templateUrl: './ouvrage-voirie.component.html',
  styleUrls: ['./ouvrage-voirie.component.scss'],
})
export class OuvrageVoirieComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initTypeOuvrageVoirie();
    this.initPosition();
    this.initCote();
  }

  initTypeOuvrageVoirie() {
    this.EOS.setupRef('typeOuvrageVoirieId', this.EOS.refs.RefOuvrageVoirie[0]);
  }

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
