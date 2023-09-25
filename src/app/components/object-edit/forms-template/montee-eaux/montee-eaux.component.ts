import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { FormsTemplateService } from 'src/app/services/formstemplate.service';
import { UuidUtils as uuid } from '../../../../utils/uuid-utils';
import { EditionModeService } from '../../../../services/edition-mode.service';


@Component({
    selector: 'form-montee-eaux',
    templateUrl: './montee-eaux.component.html',
    styleUrls: ['./montee-eaux.component.scss'],
})
export class MonteeEauxComponent implements OnInit {
    refs;

    constructor(public EOS: EditObjectService, private FT: FormsTemplateService, private editionModeService: EditionModeService) {
    }

    ngOnInit() {
        this.EOS.objectDoc.mesures = [this.createMeasure()];

        this.editionModeService.getReferenceTypes()
            .then((refs) => {
                this.refs = refs;
            });

    }

    createMeasure() {
        const defaultRef = this.refs.RefReferenceHauteur[0];

        return {
            _id: uuid.generateUuid(),
            '@class': 'fr.sirs.core.model.MesureMonteeEaux',
            date: new Date().toISOString(),
            referenceHauteurId: defaultRef ? defaultRef.id : undefined,
            hauteur: 0
        };
    }

}
