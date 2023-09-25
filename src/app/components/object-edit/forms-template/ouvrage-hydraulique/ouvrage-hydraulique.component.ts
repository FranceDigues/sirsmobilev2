import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-ouvrage-hydraulique',
  templateUrl: './ouvrage-hydraulique.component.html',
  styleUrls: ['./ouvrage-hydraulique.component.scss'],
})
export class OuvrageHydrauliqueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {

  }
}
