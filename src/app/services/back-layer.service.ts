import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { BackLayerModel, DatabaseModel } from '../models/database.model';

@Injectable({
    providedIn: 'root'
})
export class BackLayerService {

    backLayers: BackLayerModel;

    constructor(private dbService: DatabaseService) {
    }

    init() {
        return new Promise((resolve) => {
            this.dbService.getCurrentDatabaseHardDisk()
            .then(
                (db: DatabaseModel) => {
                    this.backLayers = db.context.backLayer;
                    resolve('');
                }
            );
        });
    }

    getList() {
        return this.backLayers.list;
    }

    getActive() {
        return this.backLayers.active;
    }

    getByName(name: string) {
        let i = this.backLayers.list.length;

        while (i--) {
            const layer = this.backLayers.list[i];
            if (layer.name === name) {
                return layer;
            }
        }
        return null;
    }

    setActive(name: string) {
        this.backLayers.active = this.getByName(name);
    }

    add(layer) {
        this.backLayers.list.push(layer);
        this.updateListInHardDisk();
    }

    remove(layer) {
        this.backLayers.list.splice(this.backLayers.list.indexOf(layer.name), 1);
        this.updateListInHardDisk();
    }

    updateListInHardDisk() {
        this.dbService.getCurrentDatabaseHardDisk()
        .then(
            (db: DatabaseModel) => {
                db.context.backLayer = this.backLayers;
                this.dbService.updateCurrentDatabaseHardDisk(db);
            }
        );
    }

}
