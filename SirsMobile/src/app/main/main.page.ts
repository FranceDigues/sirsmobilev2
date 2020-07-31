import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { OLService } from '../lib-map/ol.service';
import { ClassCameraService } from '../lib-camera/class.service';

import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import {Fill, RegularShape, Stroke, Style} from 'ol/style';
// // import {getWidth, getTopLeft} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {

  map: Map;

  constructor(private ol: OLService, private cam: ClassCameraService) { }

  ngAfterViewInit() {
    this.ol.createMap('map');
    this.ol.addLayer(new TileLayer(
      {
        title: 'Global Imagery',
        source: new OSM()
      }
    ));
  }

  takePhoto() {
    let res = this.cam.takePhoto();
    console.log(res);
  }

}
