import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';
import { FilterPipe } from '../../../right-panel/createobjects/createobjects.component';

@Component({
  selector: 'form-desordre',
  templateUrl: './desordre.component.html',
  styleUrls: ['./desordre.component.scss'],
})
export class DesordreComponent implements OnInit {

  constructor(public EOS: EditObjectService, public filterPipe: FilterPipe,
              private FT: FormsTemplateService) { }

  ngOnInit() {
    this.FT.initCategorie();
    this.initType();
    this.FT.initPosition();
    this.FT.initCote();
  }

  changeCategorie() {
    const condition = { categorieId: this.EOS.objectDoc.categorieDesordreId };
    const sortedArray = this.filterPipe.transform(this.EOS.refs.RefTypeDesordre, condition);

    this.EOS.objectDoc.typeDesordreId = sortedArray[0]._id;
  }

  initType() {
    const condition = { categorieId: this.EOS.objectDoc.categorieDesordreId };
    const sortedArray = this.filterPipe.transform(this.EOS.refs.RefTypeDesordre, condition);

    this.EOS.objectDoc.typeDesordreId = this.EOS.objectDoc.typeDesordreId || sortedArray[0]._id;
  }
}

@Pipe({
  name: 'refSort'
})
export class RefSortPipe  implements PipeTransform {

  transform(value: any, type: boolean) {
    const data = value.sort(this.sortOn(type));
    return data;
  }

  sortOn(type) {
    return (obj1, obj2) => {
      let a = null;
      let b = null;

      if (type) {
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
