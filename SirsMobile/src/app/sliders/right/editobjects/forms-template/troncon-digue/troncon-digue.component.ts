import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../../editobjects.service';

@Component({
  selector: 'form-troncon-digue',
  templateUrl: './troncon-digue.component.html',
  styleUrls: ['./troncon-digue.component.scss'],
})
export class TronconDigueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initCote();
  }

  initCote() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
