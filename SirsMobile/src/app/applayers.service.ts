import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { LocalDatabase } from './usingLocalDatabase.service';

@Injectable({
    providedIn: 'root'
})
export class AppLayersService {

    constructor(private localDB: LocalDatabase, private databaseSrvc: DatabaseService) { }

    favorites = this.databaseSrvc.activeDB.favorites;

    cachedDescriptions = null;


    moduleDescriptions() {
        return new Promise((resolve, rejects) => {
            if (!this.cachedDescriptions) {
                this.localDB.get('$sirs')
                .then(
                    (result) => {
                        this.cachedDescriptions = result.moduleDescriptions;
                        resolve(this.cachedDescriptions);
                    },
                    (error) => {
                        rejects(error);
                    }
                );
            } else {
                resolve(this.cachedDescriptions);
            }
        });
    }

    extraLeaves(nodes, parent?) {
        let leaves = [];

        nodes.forEach((node) => {
            node.categories = typeof parent === 'object' ? parent.categories.concat(parent.title) : [];
            if (Array.isArray(node.children)) {
                leaves = leaves.concat(this.extraLeaves(node.children, node));
            } else {
                leaves.push(node);
            }
        });
        return leaves;
    }

    getAvailable() {
        return new Promise((resolve, rejects) => {
            this.moduleDescriptions()
            .then(
                (modules: Array<any>) => {
                    let leaves = []
                    modules.forEach((module) => {
                        leaves = leaves.concat(this.extraLeaves(module.layers));
                    });
                    resolve(leaves);
                },
                (error) => {
                    rejects(error);
                }
            )
        })
    }

    getFavorites() {
        return this.favorites;
    }

    setFavorites(newFavorites) {
        this.favorites = newFavorites;
    }

    addFavorite(layer) {
        layer.editable = false;
        layer.featLabels = false;
        layer.realPosition = false;
        layer.selectable = false;
        layer.visible = false;
        layer.color = [
            Math.floor(Math.random() * 256),    // red
            Math.floor(Math.random() * 256),    // green
            Math.floor(Math.random() * 256),    // blue
            1                                   // alpha
        ];
        this.favorites.push(layer);
        // $rootScope.$broadcast('appLayerAdded', layer); // TODO reproduce this same comportement -> will mb not be same like circle dependency
    }

    removeFavorite(layer) {
        let index = this.favorites.map((item) => {
            return item.title;
        }).indexOf(layer.title);
        this.favorites.splice(index, 1);
        // $rootScope.$broadcast('appLayerRemoved', layer, index); // TODO SAME
    }
}