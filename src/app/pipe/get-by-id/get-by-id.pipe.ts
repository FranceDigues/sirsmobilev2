import { Pipe, PipeTransform } from '@angular/core';
import { DatabaseService } from "../../services/database.service";

@Pipe({
    name: 'getById'
})
export class GetByIdPipe implements PipeTransform {

    constructor(private db: DatabaseService) {

    }

    async transform(id: string): Promise<any> {
        const results = await this.db.getLocalDB().query('byId', { key: id });
        return results.rows[0].value;
    }

}
