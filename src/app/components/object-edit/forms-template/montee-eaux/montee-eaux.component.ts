import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { FormsTemplateService } from 'src/app/sliders/formstemplate.service';
import { UuidUtils as uuid } from '../../../../utils/uuid-utils';


@Component({
  selector: 'form-montee-eaux',
  templateUrl: './montee-eaux.component.html',
  styleUrls: ['./montee-eaux.component.scss'],
})
export class MonteeEauxComponent implements OnInit {

  constructor(public EOS: EditObjectService, private FT: FormsTemplateService) { }

  ngOnInit() {
    this.EOS.objectDoc.mesures = [this.createMeasure()];
    this.initEchelleLimnimetrique();
    this.FT.initDamPosition();
    this.FT.initDamSide();
  }

  createMeasure() {
    const defaultRef = this.EOS.refs.RefReferenceHauteur[0];

    return {
        _id: uuid.generateUuid(),
        '@class': 'fr.sirs.core.model.MesureMonteeEaux',
        date: new Date().toISOString(),
        referenceHauteurId: defaultRef ? defaultRef.id : undefined,
        hauteur: 0
    };
  }

  initEchelleLimnimetrique() {
    this.EOS.setupRef('echelleLimnimetriqueId', this.EOS.refs.EchelleLimnimetrique[0]);
  }

}
