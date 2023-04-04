// @ts-nocheck

import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { BackLayerModel, DatabaseModel, ListBackLayer } from '../components/database-connection/models/database.model';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { MapService } from './map.service';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import XYZ from 'ol/source/XYZ';
import WMTS from 'ol/source/WMTS';
import WFS from 'ol/format/WFS';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import TileSource from "ol/source/Tile";

@Injectable({
    providedIn: 'root'
})
export class BackLayerService {

    backLayer: LayerGroup = null;

    backLayers: BackLayerModel = null;

    private backLayerToEdit: BackLayerModel; // Variable made to transfer layer data from backmap to editBackLayer components.

    constructor(
        private dbService: DatabaseService,
        private webview: WebView,
        private ol: OLService,
        private mapService: MapService) {
    }

    async init(): Promise<void> {
        if (this.backLayer === null || this.backLayers === null) {
            const db: DatabaseModel = await this.dbService.getCurrentDatabaseSettings() as DatabaseModel;
            this.backLayers = db.context.backLayer;
            this.backLayer = this.createBackLayer();
        }
    }

    createBackLayer() {
        // * give time for backLayerService to init
        let group = new LayerGroup({
            layers: [
                this.createBackLayerInstance(this.getActive())
            ]
        });
        group.set('name', 'Background');
        return group;
    }

    createBackLayerInstance(layerModel): TileLayer<any> {
        let layer = null;
        if (typeof layerModel.cache === 'object' && layerModel.cache.active) {
            const extent = layerModel.cache.extent;

            const url = this.getUrl(layerModel.cache.url);
            const source = new XYZ({
                url
            });
            layer = new TileLayer({
                extent,
                source
            });
            layer.set('name', layerModel.name);
        } else {
            layer = new TileLayer({
                source: this.goodBackLayerSource(layerModel)
            });
            layer.set('name', layerModel.name);
            layer.set('model', layerModel);
        }
        return layer;
    }

    getUrl(url): string {
        return this.webview.convertFileSrc(url);
    }

    private goodBackLayerSource(layerModel: ListBackLayer): TileSource {
        if (layerModel.source.type === 'OSM') {
            return new OSM(layerModel.source);
        } else if (layerModel.source.type === 'TileWMS') {
            // @ts-ignore
            return new TileWMS(layerModel.source);
        } else if (layerModel.source.type === 'XYZ') {
            return new XYZ(layerModel.source);
        } else if (layerModel.source.type === 'WFS') {
            // @ts-ignore
            return new WFS().writeGetFeature(layerModel.source);
        } else if (layerModel.source.type === 'WMTS') {
            // @ts-ignore
            return new WMTS(layerModel.source);
        } else {
            return new OSM({
                url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            });
        }
    }

    // Used to set but also to refresh the active back layer.
    setActiveBackLayer(layer) {
        // if (layer !== this.backLayerService.backLayers.active) {
        this.backLayers.active = layer;
        this.updateBackLayerMap(layer);
        this.updateActiveBackLayerInHardDisk(layer);
        this.updateListInHardDisk();
        // }
    }

    private updateActiveBackLayerInHardDisk(backLayer) {
        this.dbService.getCurrentDatabaseSettings()
            .then(
                (db: DatabaseModel) => {
                    db.context.backLayer.active = backLayer;
                    this.dbService.setCurrentDatabaseSettings(db);
                }
            );
    }

    updateBackLayerMap(layer: ListBackLayer) {
        this.backLayer.getLayers().setAt(0, this.createBackLayerInstance(layer));

        if (typeof layer.cache === 'object') {
            this.mapService.currentView.fit(layer.cache.extent, { size: this.ol.map.getSize() });
        }
    }

    syncBackLayer() {
        const olLayer = this.createBackLayerInstance(this.getActive());
        this.backLayer.getLayers().setAt(0, olLayer);
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

    // Saves the list in database to find it the same way at the next app reopening.
    updateListInHardDisk() {
        this.dbService.getCurrentDatabaseSettings()
            .then(
                (db: DatabaseModel) => {
                    db.context.backLayer = this.backLayers;
                    this.dbService.setCurrentDatabaseSettings(db);
                }
            );
    }

    getBackLayerToEdit(): BackLayerModel {
        return this.backLayerToEdit;
    }

    setBackLayerToEdit(layer: BackLayerModel) {
        this.backLayerToEdit = layer;
    }

}
