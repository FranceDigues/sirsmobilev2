import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-reseau-hydraulique-ciel-ouvert',
  templateUrl: './reseau-hydraulique-ciel-ouvert.component.html',
  styleUrls: ['./reseau-hydraulique-ciel-ouvert.component.scss'],
})
export class ReseauHydrauliqueCielOuvertComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
  }
}
