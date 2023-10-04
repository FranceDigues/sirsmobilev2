import { Component } from '@angular/core';
import { BaseFormComponent } from 'src/app/components/object-edit/forms-template/base-form/base-form.component';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-desordre-dependance-ah',
  templateUrl: './desordre-dependance-ah.component.html',
  styleUrls: ['./desordre-dependance-ah.component.scss'],
})
export class DesordreDependanceAhComponent extends BaseFormComponent {

  filteredTypeDesordreList = [];

  constructor(public EOS: EditObjectService) {
    super(EOS);
    this.initfilteredTypeDesordreList();
  }

  ngOnInit() {
    super.ngOnInit();
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
