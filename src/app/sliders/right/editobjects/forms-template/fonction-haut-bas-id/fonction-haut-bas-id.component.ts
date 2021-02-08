import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/editobjects.service';

@Component({
  selector: 'form-template-fonction-haut-bas-id',
  templateUrl: './fonction-haut-bas-id.component.html',
  styleUrls: ['./fonction-haut-bas-id.component.scss'],
})
export class FonctionHautBasIdGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
