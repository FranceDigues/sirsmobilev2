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

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {

  constructor(private ol: OLService, private geoloc: GeolocService,
              private testMapService: MapService) { }

  ngAfterViewInit() {
    this.ol.createMap('map');
    this.ol.addLayer(new TileLayer(
      {
        title: 'Global Imagery',
        source: new OSM()
      }
    ));
    this.ol.addLayer(this.testMapService.geolocLayer);
    console.log(this.ol.map);
    console.log(this.ol.getLayers());
    this.locateMe();
  }

  locateMe() {
    this.geoloc.getCurrentLocation()
    .then(
      (result) => {
        console.log(result);
        this.zoomToCoords(result);
        // this.geoloc.zoomToCoords(result);
      },
      (error) => {
        console.log('Error getting location', error);
      }
    )
  }

  zoomToCoords(coords) { // TODO change this fonction to another service
    if (coords) {
      let map = this.ol.getMap();
      map.getView().setCenter(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'));
      map.getView().setZoom(18);
      // TODO try another way to change the source (with this.ol.getLayers ...)
      this.testMapService.geolocLayer.getSource().clear();
      this.testMapService.geolocLayer.getSource().addFeatures(this.createGeolocFeatureInstances(coords));
      console.log(this.ol.getLayers());
    }
  }

  createGeolocFeatureInstances(pos) {
    // var pos = [location.longitude, location.latitude];
    return [
        new Feature({
            geometry: new Point(transform([pos.longitude, pos.latitude], 'EPSG:4326', 'EPSG:3857'))
        }),
        // new Feature({
        //     geometry: Circle(pos, 200)
        //         .transform('EPSG:4326', 'EPSG:3857')
        // })
    ];
}

}
