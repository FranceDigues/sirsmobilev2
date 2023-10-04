import { Pipe, PipeTransform } from '@angular/core';
import { DatabaseService } from "../../services/database.service";

@Pipe({
    name: 'subTitleVegetation'
})
export class SubTitleVegetationPipe implements PipeTransform {

    constructor(private db: DatabaseService) {

    }

    async transform(id: string): Promise<any> {
        const results = await this.db.getLocalDB().get(id);

        if (results['typeVegetationId']) {
            const result2 = await this.db.getLocalDB().get(results['typeVegetationId']);
            if (result2 && result2.libelle) {
                return result2.libelle;
            }
        }

        if (results['especeId']) {
            const result2 = await this.db.getLocalDB().get(results['especeId']);
            if (result2 && result2.libelle) {
                return result2.libelle;
            }
        }
        return results['@class'].split(".")[4] || 'Sans catégorie';

    }

}
