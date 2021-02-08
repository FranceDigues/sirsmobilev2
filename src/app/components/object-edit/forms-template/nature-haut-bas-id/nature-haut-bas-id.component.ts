import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-template-nature-haut-bas-id',
  templateUrl: './nature-haut-bas-id.component.html',
  styleUrls: ['./nature-haut-bas-id.component.scss'],
})
export class NatureHautBasIdGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
