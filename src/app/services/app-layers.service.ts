import {Injectable} from '@angular/core';
import {DatabaseService} from './database.service';
import {LocalDatabase} from './local-database.service';
import {Random} from '../utils/uuid-utils';

@Injectable({
    providedIn: 'root'
})
export class AppLayersService {

    constructor(private localDB: LocalDatabase,
                private databaseService: DatabaseService) {
    }

    favorites = this.databaseService.activeDB.favorites;

    cachedDescriptions = null;

    public dbChanged(): void {
        this.favorites = this.databaseService.activeDB.favorites;
        this.cachedDescriptions = null;
    }

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
                    (modules: any) => {
                        let leaves = [];
                        for (const module in modules) {
                            if (modules[module].layers) {
                                leaves = leaves.concat(this.extraLeaves(modules[module].layers));
                            }
                        }
                        resolve(leaves);
                    },
                    (error) => {
                        rejects(error);
                    }
                );
        });
    }

    getFavorites() {
        return this.favorites;
    }

    getLayerModel(layerClass) {
        return this.favorites.find(item => item.filterValue === layerClass);
    }

    setFavorites(newFavorites) {
        this.favorites = newFavorites;
        this.databaseService.changeFavoritesLayers(newFavorites);
    }

    addFavorite(layer) {
        layer.editable = false;
        layer.featLabels = false;
        layer.realPosition = false;
        layer.selectable = false;
        layer.visible = false;
        layer.color = [
            Math.floor(Random() * 256),    // red
            Math.floor(Random() * 256),    // green
            Math.floor(Random() * 256),    // blue
            1                                   // alpha
        ];
        this.favorites.push(layer);
    }

    removeFavorite(layer) {
        const index = this.favorites.map((item) => {
            return item.title;
        }).indexOf(layer.title);
        this.favorites.splice(index, 1);
        return index;
    }
}
