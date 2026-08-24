import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { UuidUtils as uuid } from 'src/app/utils/uuid-utils';
import { EditionModeService } from 'src/app/services/edition-mode.service';


@Component({
    selector: 'form-montee-eaux',
    templateUrl: './montee-eaux.component.html',
    styleUrls: ['./montee-eaux.component.scss'],
})
export class MonteeEauxComponent implements OnInit {
    public refs: {[key: string]: any};

    constructor(
      public EOS: EditObjectService,
      private editionModeService: EditionModeService
    ) {}

    ngOnInit() {

        this.editionModeService.getReferenceTypes().then((refs) => {
            const res: {[key: string]: any} = {};
            for (const ref of refs) {
                res[ref[0]] = ref[1];
            }
            this.refs = res;
            this.EOS.objectDoc.mesures = [this.createMeasure()];
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
