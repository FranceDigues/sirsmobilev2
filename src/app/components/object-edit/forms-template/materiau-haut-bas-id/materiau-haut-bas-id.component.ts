import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-template-materiau-haut-bas-id',
  templateUrl: './materiau-haut-bas-id.component.html',
  styleUrls: ['./materiau-haut-bas-id.component.scss'],
})
export class MateriauHautBasIdGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
