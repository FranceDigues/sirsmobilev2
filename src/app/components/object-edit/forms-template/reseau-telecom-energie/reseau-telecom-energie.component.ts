import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-reseau-telecom-energie',
  templateUrl: './reseau-telecom-energie.component.html',
  styleUrls: ['./reseau-telecom-energie.component.scss'],
})
export class ReseauTelecomEnergieComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
  }
}
