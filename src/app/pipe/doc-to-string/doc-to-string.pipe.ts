import { Pipe, PipeTransform } from '@angular/core';
import { DatabaseService } from "../../services/database.service";
import { DatabaseModel } from "../../components/database-connection/models/database.model";

@Pipe({
    name: 'docToString'
})
export class DocToStringPipe implements PipeTransform {

    constructor(private databaseService: DatabaseService) {

    }

    transform(doc: any): Promise<string> {
        return this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                const showTextConfig = config.context.showText;
                const id = doc._id || doc.id;

                if (showTextConfig === "fullName") {
                    return doc.libelle ? doc.libelle : "id: " + id;
                } else if (showTextConfig === "abstract") {
                    return doc.abrege ? doc.abrege : doc.designation + ' : ' + doc.libelle
                } else if (showTextConfig === "both") {
                    return doc.abrege ? doc.abrege + ' : ' + doc.libelle : doc.designation + ' : ' + doc.libelle
                } else {
                    return doc.abrege ? doc.abrege + ' : ' + doc.libelle : doc.designation + ' : ' + doc.libelle
                }
            });
    }

}
