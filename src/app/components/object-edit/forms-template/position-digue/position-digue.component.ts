import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-template-position-digue',
  templateUrl: './position-digue.component.html',
  styleUrls: ['./position-digue.component.scss'],
})
export class PositionDigueGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
