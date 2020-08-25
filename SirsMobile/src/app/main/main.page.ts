import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core';
import { OLService } from '@lib-map/ol.service';
import { LoadingController, NavController } from '@ionic/angular';
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
import { AppLayer, EditionLayer, GeolocLayer, BackLayer } from '../layers.service';
import { AuthService } from '../auth.service';
import { MenuController } from '@ionic/angular';
import { BackLayerService } from '../backlayer.service';
import { AppVersionsService } from '../appversions.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {

  navbarController = true; // ? mb remove bcs unused

  constructor(private ol: OLService, private backLayerService: BackLayerService, public geoloc: GeolocService,
              public editionLayer: EditionLayer, private geolocLayer: GeolocLayer, private sirsDocSrvc: SirsDocService, private mapService: MapService,
              private appLayer: AppLayer, private authService: AuthService, private menu: MenuController,
              private appVersionsService: AppVersionsService, private backLayer: BackLayer,) {
                this.appVersionsService.init();
              }

  ngAfterViewInit() {
    this.sirsDocSrvc.initializeDoc()
    .then(
      (sirsDoc: any) => {
        proj4.defs(sirsDoc.epsgCode, sirsDoc.proj4);
        register(proj4);
      }
    );
    this.backLayerService.init()
    .then(
      () => {
        this.ol.createMap('map');
        this.ol.getMap().setView(this.mapService.currentView);
        this.ol.addLayer(this.backLayer.backLayer);
        this.ol.addLayer(this.appLayer.appLayer)
        this.ol.addLayer(this.editionLayer.editionLayer);
        this.ol.addLayer(this.geolocLayer.geolocLayer);
      }
    )
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

  refresh() {
    // window.location.reload();
  }

  logout() {
    this.authService.logout();
  }

  openSliderLeft() {
    this.menu.open('left-slider');
  }

  openSliderRight() {
    this.menu.open('right-slider');
  }

}
