import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OLService } from '@lib-map/ol.service';
import { LoadingController } from '@ionic/angular';
import { GeolocService } from '../geoloc.service';

import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import {Fill, RegularShape, Stroke, Style} from 'ol/style';
// // import {getWidth, getTopLeft} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import { MapService } from '../map.service';
import Feature from 'ol/Feature';
import Circle from 'ol/geom/Circle';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4'
import { SirsDocService } from '../sirsdoc.service';
import { AppLayer, BackLayer, EditionLayer, GeolocLayer } from '../layers.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {

  constructor(private ol: OLService, private geoloc: GeolocService,
              private editionLayer: EditionLayer, private geolocLayer: GeolocLayer,
              private sirsDocSrvc: SirsDocService, private mapService: MapService,
              private backLayer: BackLayer, private appLayer: AppLayer) {
                this.sirsDocSrvc.get().then(
                  (sirsDoc) => {
                    proj4.defs(sirsDoc.epsgCode, sirsDoc.proj4);
                    register(proj4);
                  }
                )
              }

  ngAfterViewInit() {
    this.ol.createMap('map');
    this.ol.getMap().setView(this.mapService.currentView);
    this.ol.addLayer(this.backLayer.backLayer);
    this.ol.addLayer(this.appLayer.appLayer)
    this.ol.addLayer(this.editionLayer.editionLayer);
    this.ol.addLayer(this.geolocLayer.geolocLayer);
    this.locateMe();
  }

  locateMe() {
    this.geoloc.getCurrentLocation()
    .then(
      (result) => {
        console.log(result);
        this.zoomToMe();
      },
      (error) => {
        console.log('Error getting location', error);
      }
    )
  }

  zoomToMe() {
    const coords = this.geoloc.getCoords();
    if (coords) {
      let map = this.ol.getMap();
      map.getView().setCenter(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'));
      map.getView().setZoom(18);
      this.geolocLayer.redrawGeolocLayer(coords);
    }
  }

}
