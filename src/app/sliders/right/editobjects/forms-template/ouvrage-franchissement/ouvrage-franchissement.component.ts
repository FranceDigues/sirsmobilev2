import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';
import { FormsTemplateService } from 'src/app/formstemplate.service';

@Component({
  selector: 'form-ouvrage-franchissement',
  templateUrl: './ouvrage-franchissement.component.html',
  styleUrls: ['./ouvrage-franchissement.component.scss'],
})
export class OuvrageFranchissementComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.EOS.objectDoc.largeur = this.EOS.objectDoc.largeur || 0;
    this.FT.initOrientationOuvrage();
    this.FT.initUsage();
    this.FT.initRevetementHaut();
    this.FT.initRevetementBas();
    this.FT.initTypeOuvrage();
    this.FT.initPositionHaut();
    this.FT.initPositionBas();
    this.FT.initCote();
  }

}
