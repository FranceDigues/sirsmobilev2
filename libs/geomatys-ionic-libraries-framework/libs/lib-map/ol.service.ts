import { Injectable } from '@angular/core';
import { ClassMapService } from './class.service';
import Map from 'ol/Map';
import { Layer } from 'ol/layer';
import View from 'ol/View';
import { defaults } from 'ol/control';
import LayerGroup from "ol/layer/Group";

@Injectable({
  providedIn: 'root'
})
export class OLService extends ClassMapService {

    constructor() {
        super();
    }

    createMap(name: string, target=null, moveTolerance=1): Map {
        this.map = new Map({
            layers: [],
            view: new View({
                zoom: 0,
                center: [0, 0]
            }),
            controls: defaults({
                attribution: false,
                zoom: false,
                rotate: false
            }),
            moveTolerance
        });
        this.map.setTarget(name);
        return (this.map);
    }

    addLayer(layer: Layer | LayerGroup): void {
        this.map.addLayer(layer);
    }

    getLayers(): Array<Layer> {
        const layers = this.map.getLayers();
        // @ts-ignore
        return (layers.array_);
    }

    removeLayer(layer: Layer): void {
        this.map.removeLayer(layer);
    }

    moveUp(layer: Layer): void {
        this.removeLayer(layer);
        // @ts-ignore
        layer.values_.zIndex += 1;
        this.addLayer(layer);
    }

    moveDown(layer: Layer): void {
        this.removeLayer(layer);
        // @ts-ignore
        layer.values_.zIndex -= 1;
        this.addLayer(layer);
    }
}
