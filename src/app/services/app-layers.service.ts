import {Injectable} from '@angular/core';
import {DatabaseService} from './database.service';
import {LocalDatabase} from './local-database.service';
import {Random} from '../utils/uuid-utils';
import { PluginUtils } from "../utils/plugin-utils";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppLayersService {

    private _layerChangeSubject: Subject<void> = new Subject<void>();

    constructor(private localDB: LocalDatabase,
                private databaseService: DatabaseService) {
    }

    favorites = this.databaseService.activeDB.favorites;

    cachedDescriptions = null;

    /**
     * Called when an edit in the layers is made in the layers
     *
     * For now, it is called only from the layer manager
     * @private
     */
    public get onLayerChange(): Observable<void> {
        return this._layerChangeSubject.asObservable();
    }

    public dbChanged(): void {
        this.favorites = this.databaseService.activeDB.favorites;
        this.cachedDescriptions = null;
    }

    public notifyLayerChange(): void {
        this._layerChangeSubject.next();
    }

    public async moduleDescriptions(): Promise<any> {
        if (!this.cachedDescriptions) {
            const result = await this.localDB.get('$sirs');
            this.cachedDescriptions = result.moduleDescriptions;
            return this.cachedDescriptions;
        } else {
            return this.cachedDescriptions;
        }
    }

    extraLeaves(nodes, parent?) {
        let leaves = [];
        nodes.forEach((node) => {
            node.categories = typeof parent === 'object' ? parent.categories.concat(parent.title) : [];

            /* exclude degree of urgency */
            if (node.title && node.title === 'Degrés d\'urgence') {
                return;
            }

            if (Array.isArray(node.children)) {
                leaves = leaves.concat(this.extraLeaves(node.children, node));
            } else {
                leaves.push(node);
            }
        });
        return leaves;
    }

    public async getAvailable() {
        const modules: any = await this.moduleDescriptions();
        let leaves = [];
        for (const module in modules) {
            if (modules[module].layers) {
                leaves = leaves.concat(this.extraLeaves(modules[module].layers));
            }
        }

        return leaves;
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
