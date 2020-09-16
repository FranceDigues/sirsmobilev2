import { AfterViewInit, Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
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
import { register } from 'ol/proj/proj4';
import { SirsDocService } from '../sirsdoc.service';
import { AppLayer, EditionLayer, GeolocLayer, BackLayer } from '../layers.service';
import { AuthService } from '../auth.service';
import { MenuController } from '@ionic/angular';
import { BackLayerService } from '../backlayer.service';
import { AppVersionsService } from '../appversions.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { DatabaseService } from '../database.service';
import { DatabaseModel } from '../models/database.model';
import DragPan from 'ol/interaction/DragPan';
import Draw from 'ol/interaction/Draw';



@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {

  navbarController = true; // ? mb remove bcs unused

  pathRightSlide = 'objectsCreation';

  constructor(private ol: OLService, private backLayerService: BackLayerService, public geoloc: GeolocService,
              public editionLayer: EditionLayer, private geolocLayer: GeolocLayer, private sirsDocSrvc: SirsDocService,
              private mapService: MapService, private appLayer: AppLayer, private authService: AuthService,
              private menu: MenuController, private appVersionsService: AppVersionsService, private backLayer: BackLayer,
              private loadingCtrl: LoadingController, private platform: Platform, private dbService: DatabaseService) {
                this.appVersionsService.init();
                this.backLayer.init();
                this.appLayer.init();
                this.editionLayer.init();
                this.geolocLayer.init();
                this.platform.pause.subscribe(
                  async () => {
                    console.log('here ?????');
                    const currentView = this.mapService.currentView;
                    if (currentView) {
                      this.dbService.getCurrentDatabaseHardDisk().
                      then(
                        (db: DatabaseModel) => {
                          db.context.currentView = {
                            zoom: this.ol.map.getView().getZoom(),
                            coords: this.ol.map.getView().getCenter()
                          };
                          this.dbService.updateCurrentDatabaseHardDisk(db);
                          console.log('Update View');
                        }
                      );
                    }
                });
              }

  ngAfterViewInit() {
    let loading: HTMLIonLoadingElement = null;
    this.sirsDocSrvc.initializeDoc()
    .then(
      (sirsDoc: any) => {
        proj4.defs(sirsDoc.epsgCode, sirsDoc.proj4);
        register(proj4);
      }
    );
    this.backLayerService.init()
    .then(
      async () => {
        loading = await this.loadingCtrl.create({
          message: 'Déploiement de la carte en cours'
        });
        loading.present();
        this.ol.createMap('map');
        this.ol.getMap().setView(this.mapService.currentView);
        this.ol.addLayer(this.backLayer.backLayer);
        this.ol.addLayer(this.appLayer.appLayer);
        this.ol.addLayer(this.editionLayer.editionLayer);
        this.ol.addLayer(this.geolocLayer.geolocLayer);
        const test1 = transform([2.276, 48.517], 'EPSG:4326', 'EPSG:3857');
        const test2 = transform(test1, 'EPSG:3857', 'EPSG:4326');
        console.log('test1', test1);
        console.log('test2', test2);
        setTimeout(() => { loading.dismiss(); }, 1000);
      }
    );
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
    );
  }

  zoomToMe() {
    const coords = this.geoloc.getCoords();
    if (coords) {
      const map = this.ol.getMap();
      map.getView().setCenter(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'));
      map.getView().setZoom(18);
      this.geolocLayer.redrawGeolocLayer(coords);
    }
  }

  refresh() {
  }

  logout() {
    this.authService.logout();
  }

  handleSliderLeft() {
    this.menu.isOpen('left-slider')
    .then(
      (bool) => {
        if (bool) {
          this.menu.close('left-slider');
        } else {
          this.menu.open('left-slider');
        }
      }
    );
  }

  handleSliderRight() {
    this.menu.isOpen('right-slider')
    .then(
      (bool) => {
        if (bool) {
          this.menu.close('right-slider');
        } else {
          this.menu.open('right-slider');
        }
      }
    );
  }

  openObjectsCreate() {
    this.menu.isOpen('right-slider')
    .then(
      (bool) => {
        if (bool) {
          if (this.pathRightSlide !== 'objectsCreation') {
            this.pathRightSlide = 'objectsCreation';
          }
        } else {
          this.pathRightSlide = 'objectsCreation';
          this.menu.open('right-slider');
        }
      }
    );
  }

  openShoreLine() {
    this.menu.isOpen('right-slider')
    .then(
      (bool) => {
        if (bool) {
          this.pathRightSlide = 'shoreLine';
        } else {
          this.pathRightSlide = 'shoreLine';
          this.menu.open('right-slider');
        }
      }
    );
  }

}
