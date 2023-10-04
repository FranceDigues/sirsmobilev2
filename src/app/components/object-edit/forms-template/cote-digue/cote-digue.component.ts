import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-template-cote-digue',
  templateUrl: './cote-digue.component.html',
  styleUrls: ['./cote-digue.component.scss'],
})
export class CoteDigueGenericComponent implements OnInit {

  public refCote: Array<any>;

  constructor(public EOS: EditObjectService) { }

  public ngOnInit() {
    this.refCote = this.EOS.refs.RefCote.sort(this.sortOn());
  }

  private sortOn() {
    return (obj1, obj2) => {
      let a, b;

      if (this.EOS.showText('fullName')) {
        a = obj1.libelle;
        b = obj2.libelle;
      } else {
        a = obj1.abrege ? obj1.abrege : obj1.designation;
        b = obj2.abrege ? obj2.abrege : obj2.designation;
      }

      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    };
  }

}
