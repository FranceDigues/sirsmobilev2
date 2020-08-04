import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OLService } from '../lib-map/ol.service';
import { CameraService } from '../lib-camera/camera.service';

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
  image = '';

  // @ViewChild("map") map: ElementRef;

  constructor(private ol: OLService, private cam: CameraService) { }

  ngAfterViewInit() {
    this.ol.createMap('map');
    this.ol.addLayer(new TileLayer(
      {
        title: 'Global Imagery',
        source: new OSM()
      }
    ));
  }

  async takePhoto() {
    let res = await this.cam.takePhoto();
    console.log(res);
    this.image = res;
  }

  async getPhoto() {
    let res = await this.cam.getPictureInGallery();
    console.log(res);
    this.image = res;
  }

}
