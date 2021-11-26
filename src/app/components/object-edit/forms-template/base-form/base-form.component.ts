import { Component, OnInit } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'app-base-form',
  templateUrl: './base-form.component.html',
  styleUrls: ['./base-form.component.scss'],
})
export class BaseFormComponent implements OnInit {

  primitives = [];
  singleReferences = [];
  // Not supported yet
  //multipleReferences = [];

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    let formConf = this.FT.formTemplatePilote[this.EOS.type];
    for (let key in formConf) {
      let value = formConf[key];
      if (value['reference'] === true) {
        if (value['multiple'] === 1) {
          this.EOS.setupRef(value.name, this.EOS.refs[value.type]);
          this.singleReferences.push(value);
        }
      } else {
        let defaultValue = undefined;
        if (value.type === "EInt" || value.type === "EFloat" || value.type === "number") {
          defaultValue = 0;
          value.type = "number";
        } else if (value.type === "EString" || value.type === "text") {
          defaultValue = "";
          value.type = "text";
        } else if (value.type === "EBoolean" || value.type === "checkbox") {
          defaultValue = false;
          value.type = "checkbox";
        } else {
          console.log("Error: Unrecognized input type: " + value.type);
        }
        this.EOS.objectDoc[value.name] = this.EOS.objectDoc[value.name] || defaultValue;
        this.primitives.push(value);
      }
    }
  }

  private isSelected(singleReference, eosReference) {
    if (typeof eosReference._id === 'undefined') {
      return this.EOS.objectDoc[singleReference.name] === eosReference.id;
    } else {
      return this.EOS.objectDoc[singleReference.name] === eosReference._id;
    }
  }

  private title(eosReference) {
    if (this.EOS.showText('fullName')) {
      return eosReference.libelle ? eosReference.libelle : 'libellé indéterminé / id:  ' + eosReference.id;
    } else if (this.EOS.showText('abstract')) {
      return eosReference.abrege ? eosReference.abrege : eosReference.designation + ' : ' + eosReference.libelle
    } else if (this.EOS.showText('both')) {
      return eosReference.abrege ? eosReference.abrege + ' : ' + eosReference.libelle : eosReference.designation + ' : ' + eosReference.libelle
    } else {
      throw "Unexpected behaviour showTextConfig should be defined";
    }
  }

  private optionValue(eosReference) {
    if (typeof eosReference._id === 'undefined') {
      return eosReference.id;
    } else {
      return eosReference._id;
    }
  }
}
