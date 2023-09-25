import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-ouvrage-voirie',
  templateUrl: './ouvrage-voirie.component.html',
  styleUrls: ['./ouvrage-voirie.component.scss'],
})
export class OuvrageVoirieComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
  }

}
