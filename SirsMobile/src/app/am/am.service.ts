import { Injectable } from '@angular/core';
import { AMModel } from './am.model';
import Map from 'ol/Map';
import Layer from 'ol/layer';

@Injectable({
  providedIn: 'root'
})
export abstract class AmService implements AMModel {

  map: Map;

  constructor() { }

  getMap(): Map {
    return (this.map);
  }

  abstract createMap(name: string, target?: string): Map;

  abstract addLayer(layer: Layer): void;

  abstract getLayers(): Array<Layer>;

  abstract removeLayer(layer: Layer): void;

  abstract moveUp(layer: Layer): void;

  abstract moveDown(layer: Layer): void;
}
