import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { DatabaseModel } from './models/database.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalConfigService {

    context: 'fullName' | 'abstract' | 'both' = 'fullName';

    constructor(private dbService: DatabaseService) { }

    updateValue(value: 'fullName' | 'abstract' | 'both') {
        this.dbService.getCurrentDatabaseHardDisk()
        .then(
            (database: DatabaseModel) => {
                this.context = value;
                database.context.showText = value;
                this.dbService.updateCurrentDatabaseHardDisk(database);
            },
        );
    }

    getValue() {
        return this.context;
    }
}
