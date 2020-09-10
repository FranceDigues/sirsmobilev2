import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-ouvrage-particulier',
  templateUrl: './ouvrage-particulier.component.html',
  styleUrls: ['./ouvrage-particulier.component.scss'],
})
export class OuvrageParticulierComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initTypeOuvrageParticulier();
    this.initDamPosition();
    this.initDamSide();
  }

  initTypeOuvrageParticulier() {
    this.EOS.setupRef('typeOuvrageParticulierId', this.EOS.refs.RefOuvrageParticulier[0]);
  }

  initDamPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initDamSide() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
