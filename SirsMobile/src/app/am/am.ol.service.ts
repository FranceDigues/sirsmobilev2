import { Injectable } from '@angular/core';
import { AmService } from './am.service';
import Map from 'ol/Map';
import Layer from 'ol/layer';
import BaseLayer from 'ol/layer/Base';

@Injectable({
  providedIn: 'root'
})
export class AmOLService extends AmService {

    constructor() {
        super();
    }

    createMap(name: string, target?: string): Map {
        if (!target) {
            this.map = new Map({
                target: name
            });
        }
        return (this.map);
    };

    addLayer(layer: Layer): void {
        this.map.addLayer(layer);
    };

    getLayers(): Array<Layer> {
        return (this.map.getLayers());
    };

    removeLayer(layer: Layer): void {
        this.map.removeLayer(layer);
    };

    moveUp(layer: Layer): void {
        this.removeLayer(layer);
        layer.setZIndex(layer.getZIndex() + 1);
        this.addLayer(layer);
    };

    moveDown(layer: Layer): void {
        this.removeLayer(layer);
        layer.setZIndex(layer.getZIndex() - 1);
        this.addLayer(layer);
    };


}