import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-station-pompage',
  templateUrl: './station-pompage.component.html',
  styleUrls: ['./station-pompage.component.scss'],
})
export class StationPompageComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
  }

}
