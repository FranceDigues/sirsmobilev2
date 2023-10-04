import { Pipe, PipeTransform } from '@angular/core';
import { EditObjectService } from "../../services/edit-object.service";

@Pipe({
    name: 'formatOptionText'
})
export class FormatOptionTextPipe implements PipeTransform {

    constructor(public EOS: EditObjectService) {

    }

    transform(obj: any): string {
        switch (this.EOS.showTextConfig) {
            case 'fullName':
                return obj.libelle;
            case 'abstract':
                return obj.abrege ? obj.abrege
                    : (obj.designation + ' : ' + obj.libelle);
            default:
                return obj.abrege
                    ? obj.abrege + ' : ' + obj.libelle
                    : obj.designation + ' : ' + obj.libelle;
        }
    }

}
