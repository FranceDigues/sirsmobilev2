import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
// import {getWidth, getTopLeft} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
// import {get as getProjection} from 'ol/proj';
import OSM from 'ol/source/OSM';
// import WMTS from 'ol/source/WMTS';
// import WMTSTileGrid from 'ol/tilegrid/WMTS';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit, AfterViewInit {

  map: Map;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          title: 'Global Imagery',
          source: new OSM()
        })
      ],
      view: new View({
        projection: 'EPSG:4326',
        center: [0, 0],
        zoom: 0,
        maxResolution: 0.703125
      })
    });
  }

}
