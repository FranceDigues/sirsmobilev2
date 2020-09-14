import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { EditObjectService } from '../../../../../editobjects.service';
import { FilterPipe } from '../../../createobjects/createobjects.component';

@Component({
  selector: 'form-desordre',
  templateUrl: './desordre.component.html',
  styleUrls: ['./desordre.component.scss'],
})
export class DesordreComponent implements OnInit {

  constructor(public EOS: EditObjectService, public filterPipe: FilterPipe) { }

  ngOnInit() {
    this.initCategorie();
    this.initType();
    this.initPosition();
    this.initCoteID();
  }

  changeCategorie() {
    this.EOS.objectDoc.typeDesordreId = this.filterPipe.transform(this.EOS.refs.RefTypeDesordre, { categorieId: this.EOS.objectDoc.categorieDesordreId })[0]._id;
  }

  initCategorie() {
    this.EOS.setupRef('categorieDesordreId', this.EOS.refs.RefCategorieDesordre[0]);
  }

  initType() {
    this.EOS.objectDoc.typeDesordreId = this.EOS.objectDoc.typeDesordreId || (this.filterPipe.transform(this.EOS.refs.RefTypeDesordre, { categorieId: this.EOS.objectDoc.categorieDesordreId }))[0]._id;
  }

  initPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initCoteID() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
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
