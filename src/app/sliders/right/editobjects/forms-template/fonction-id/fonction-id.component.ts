import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';

@Component({
  selector: 'form-template-fonction-id',
  templateUrl: './fonction-id.component.html',
  styleUrls: ['./fonction-id.component.scss'],
})
export class FonctionIdGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
