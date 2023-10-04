import { ElementRef } from '@angular/core';
import Map from 'ol/Map';
import { Layer } from 'ol/layer';

export interface ClassMapModel {
    map: Map;

    createMap: (name: string, target?: ElementRef) => Map;

    getMap: () => Map;

    addLayer: (layer: Layer) => void;

    getLayers: () => Array<Layer>;

    removeLayer: (layer: Layer) => void;

    moveUp: (layer: Layer) => void;

    moveDown: (layer: Layer) => void;
}
