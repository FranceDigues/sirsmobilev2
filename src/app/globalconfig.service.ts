import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { DatabaseModel } from './models/database.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalConfigService {

    context = 'fullName';

    constructor(private dbService: DatabaseService) { }

    updateValue(value: string) {
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
