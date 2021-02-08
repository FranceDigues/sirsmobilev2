import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/editobjects.service';

@Component({
  selector: 'form-template-cote-digue',
  templateUrl: './cote-digue.component.html',
  styleUrls: ['./cote-digue.component.scss'],
})
export class CoteDigueGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
