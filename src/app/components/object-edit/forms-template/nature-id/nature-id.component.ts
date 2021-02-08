import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-template-nature-id',
  templateUrl: './nature-id.component.html',
  styleUrls: ['./nature-id.component.scss'],
})
export class NatureIdGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
