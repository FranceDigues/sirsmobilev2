import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { formTemplatePilote } from 'src/app/utils/form-template-pilote';

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

  attributeFilter = {
    "Prestation": ["borneDebutId", "borne_debut_aval", "borne_debut_distance", "positionDebut", "prDebut",
      "borneFinId", "borne_fin_aval", "borne_fin_distance", "positionFin", "prFin", "systemeRepId",
      "longitudeMin", "longitudeMax", "latitudeMin", "latitudeMax", "geometryMode", "editedGeoCoordinate",
      "linearId"],
    "OuvrageAssocieAmenagementHydraulique": ["amenagementHydrauliqueId", "dependanceId"],
    "PrestationAmenagementHydraulique": ["amenagementHydrauliqueId", "dependanceId"],
    "AmenagementHydraulique": ["amenagementHydrauliqueId", "dependanceId"],
    "DesordreDependance": ["amenagementHydrauliqueId", "dependanceId"],
    "StructureAmenagementHydraulique": ["amenagementHydrauliqueId", "dependanceId"],
    "OrganeProtectionCollective": ["amenagementHydrauliqueId", "dependanceId"]
  }

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    let formConf = this.conf(this.EOS.type);
    for (let key in formConf) {
      let value = formConf[key];
      if (value['reference'] === true) {
        if (value['multiple'] === 1) {
          this.EOS.setupRef(value.name, this.EOS.refs[value.type]);
          this.singleReferences.push(value);
        }
      } else {
        let defaultValue = undefined;
        if (value.type === "EInt" || value.type === "EFloat" || value.type === "EDouble" || value.type === "number") {
          defaultValue = 0;
          value.type = "number";
        } else if (value.type === "EString" || value.type === "Point" || value.type === "text") {
          defaultValue = "";
          value.type = "text";
        } else if (value.type === "EBoolean" || value.type === "EBooleanObject" || value.type === "checkbox") {
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

  private optionValue(eosReference) {
    if (typeof eosReference._id === 'undefined') {
      return eosReference.id;
    } else {
      return eosReference._id;
    }
  }

  private refList(type) {
    return this.EOS.refs[type] || [];
  }

  private conf(clazz) {
    var conf = Object.assign({}, formTemplatePilote[clazz]);
    if (clazz in this.attributeFilter) {
      for (const toRemove of this.attributeFilter[clazz]) {
        delete conf[toRemove];
      }
    } else {
      console.log('BaseFormComponent: No attribute to filter for the class :' + clazz);
    }
    return conf;
  }
}
