import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-template-materiau-id',
  templateUrl: './materiau-id.component.html',
  styleUrls: ['./materiau-id.component.scss'],
})
export class MateriauIdGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
