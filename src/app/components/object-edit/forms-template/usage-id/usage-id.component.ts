import { Component } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-template-usage-id',
  templateUrl: './usage-id.component.html',
  styleUrls: ['./usage-id.component.scss'],
})
export class UsageIdGenericComponent {

  constructor(public EOS: EditObjectService) { }

}
