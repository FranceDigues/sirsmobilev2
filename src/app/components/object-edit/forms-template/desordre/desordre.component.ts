import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from '../../../../services/edit-object.service';
import { FilterPipe } from '../../../right-panel/create-object/create-object.component';

@Component({
  selector: 'form-desordre',
  templateUrl: './desordre.component.html',
  styleUrls: ['./desordre.component.scss'],
})
export class DesordreComponent implements OnInit {

  filteredTypeDesordreList = [];

  constructor(public EOS: EditObjectService, public filterPipe: FilterPipe,
              private FT: FormsTemplateService) { }

  ngOnInit() {
    this.initfilteredTypeDesordreList();
  }

  private initfilteredTypeDesordreList() {
    this.filteredTypeDesordreList = this.EOS.refs.RefTypeDesordre;
  }

  private changeType() {
    if (this.EOS.objectDoc.typeDesordreId && this.EOS.objectDoc.typeDesordreId !== '') {
      const typeDesordre = this.EOS.refs.RefTypeDesordre.find(typeDesordre => typeDesordre._id === this.EOS.objectDoc.typeDesordreId);
      if (typeDesordre) {
        this.EOS.objectDoc.categorieDesordreId = typeDesordre.categorieId;
      }
    }
  }

  private changeCategorie() {
    if (this.EOS.objectDoc.categorieDesordreId && this.EOS.objectDoc.categorieDesordreId !== '') {
      const typesFilteredByCategorie = this.EOS.refs.RefTypeDesordre.filter(
        typeDesordre => typeDesordre.categorieId === this.EOS.objectDoc.categorieDesordreId
      )
      this.filteredTypeDesordreList = typesFilteredByCategorie;
    } else {
      this.filteredTypeDesordreList = this.EOS.refs.RefTypeDesordre;
    }
    this.EOS.objectDoc.typeDesordreId = null;
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
