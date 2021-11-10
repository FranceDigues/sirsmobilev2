import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { Inject }  from '@angular/core';
import { DOCUMENT } from '@angular/common'; 

@Component({
  selector: 'app-base-form',
  templateUrl: './base-form.component.html',
  styleUrls: ['./base-form.component.scss'],
})
export class BaseFormComponent implements OnInit {

  primitives = [];
  singleReferences = [];
  multipleReferences = [];

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService, @Inject(DOCUMENT) document) { }

  ngOnInit() {
    let formConf = this.FT.formTemplatePilote[this.EOS.type];
    for (let key in formConf) {
      let value = formConf[key];
      if (value['reference'] === true) {
        if (value['multiple'] === -1) {
          if (value['containment'] === false) {
            // Not supported yet
            // this.EOS.setupRef(value.name, this.EOS.refs[value.type], true);
            // this.multipleReferences.push(value);
          } else {
            // Not supported yet
          }
        } else {
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
}
