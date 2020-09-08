import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/editobjects.service';
import { UuidUtils as uuid } from '../../../../../../uuid-utils';


@Component({
  selector: 'form-montee-eaux',
  templateUrl: './montee-eaux.component.html',
  styleUrls: ['./montee-eaux.component.scss'],
})
export class MonteeEauxComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.EOS.objectDoc.mesures = [this.createMeasure()];
    this.initEchelleLimnimetrique();
    this.initDamPosition();
    this.initDamSide();
  }

  createMeasure() {
    const defaultRef = this.EOS.refs.RefReferenceHauteur[0];

    return {
        '_id': uuid.generateUuid(),
        '@class': 'fr.sirs.core.model.MesureMonteeEaux',
        'date': new Date().toISOString(),
        'referenceHauteurId': defaultRef ? defaultRef.id : undefined,
        'hauteur': 0
    };
  }

  initEchelleLimnimetrique() {
    this.EOS.setupRef('echelleLimnimetriqueId', this.EOS.refs.EchelleLimnimetrique[0])
  }

  initDamPosition() {
    this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
  }

  initDamSide() {
    this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
  }

}
