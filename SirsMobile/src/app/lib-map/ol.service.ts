import { Injectable, ElementRef } from '@angular/core';
import { ClassMapService } from './class.service';
import Map from 'ol/Map';
import Layer from 'ol/layer';
import View from 'ol/View';

@Injectable({
  providedIn: 'root'
})
export class OLService extends ClassMapService { // TODO write tests

    constructor() {
        super();
    }

    createMap(name: string, target?: ElementRef): Map {
        this.map = new Map({
            view: new View({
                zoom: 0,
                center: [0, 0]
            })
        });
        if (!target) {
            this.map.setTarget(name);
        } else {
            this.map.setTarget(target); // TODO test it
        }
        return (this.map);
    };

    addLayer(layer: Layer): void { // * Tested
        this.map.addLayer(layer);
    };

    getLayers(): Array<Layer> { // * Tested
        let layers = this.map.getLayers()
        return (layers['array_']);
    };

    removeLayer(layer: Layer): void { // * Tested
        this.map.removeLayer(layer);
    };

    moveUp(layer: Layer): void { // * Tested
        this.removeLayer(layer);
        layer['values_'].zIndex += 1;
        this.addLayer(layer);
    };

    moveDown(layer: Layer): void { // * Tested
        this.removeLayer(layer);
        layer['values_'].zIndex -= 1;
        this.addLayer(layer);
    };


}