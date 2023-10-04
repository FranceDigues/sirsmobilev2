import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-ouvrage-franchissement',
  templateUrl: './ouvrage-franchissement.component.html',
  styleUrls: ['./ouvrage-franchissement.component.scss'],
})
export class OuvrageFranchissementComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
  }

}
