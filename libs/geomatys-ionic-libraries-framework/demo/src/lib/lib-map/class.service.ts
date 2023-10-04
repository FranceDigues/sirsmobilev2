import { ElementRef, Injectable } from '@angular/core';
import { ClassMapModel } from './interface.model';
import Map from 'ol/Map';
import { Layer } from 'ol/layer';


@Injectable({
  providedIn: 'root'
})
export abstract class ClassMapService implements ClassMapModel {

  map: Map;

  getMap(): Map {
    if (this.map === undefined) {
      return null;
    } else {
      return (this.map);
    }
  }

  abstract createMap(name: string, target?: ElementRef): Map;

  abstract addLayer(layer: Layer): void;

  abstract getLayers(): Array<Layer>;

  abstract removeLayer(layer: Layer): void;

  abstract moveUp(layer: Layer): void;

  abstract moveDown(layer: Layer): void;
}
