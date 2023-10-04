import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-voie-digue',
  templateUrl: './voie-digue.component.html',
  styleUrls: ['./voie-digue.component.scss'],
})
export class VoieDigueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
  }

}
