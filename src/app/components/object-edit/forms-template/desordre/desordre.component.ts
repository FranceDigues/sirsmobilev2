import { Component, OnInit } from '@angular/core';
import { EditObjectService } from '../../../../services/edit-object.service';

@Component({
  selector: 'form-desordre',
  templateUrl: './desordre.component.html',
  styleUrls: ['./desordre.component.scss'],
})
export class DesordreComponent implements OnInit {

  filteredTypeDesordreList = [];

  constructor(public EOS: EditObjectService) {}

  public ngOnInit(): void {
    this.initfilteredTypeDesordreList();
  }

  private initfilteredTypeDesordreList(): void {
    this.filteredTypeDesordreList = this.EOS.refs.RefTypeDesordre;
  }

  public changeType(): void {
    if (this.EOS.objectDoc.typeDesordreId && this.EOS.objectDoc.typeDesordreId !== '') {
      const typeDesordre = this.EOS.refs.RefTypeDesordre.find(typeDesordre => typeDesordre._id === this.EOS.objectDoc.typeDesordreId);
      if (typeDesordre) {
        this.EOS.objectDoc.categorieDesordreId = typeDesordre.categorieId;
      }
    }
  }

  public changeCategorie(): void {
    this.filteredTypeDesordreList = this.EOS.refs.RefTypeDesordre;

    if (this.EOS.objectDoc.categorieDesordreId) {
      this.filteredTypeDesordreList = this.EOS.refs.RefTypeDesordre.filter(
          (typeDesordre: { categorieId: any; }) => typeDesordre.categorieId === this.EOS.objectDoc.categorieDesordreId
      );
    }

    this.EOS.objectDoc.typeDesordreId = null;
  }
}
