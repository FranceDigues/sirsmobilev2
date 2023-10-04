import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-ouvrage-telecom-energie',
  templateUrl: './ouvrage-telecom-energie.component.html',
  styleUrls: ['./ouvrage-telecom-energie.component.scss'],
})
export class OuvrageTelecomEnergieComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
  }

}
