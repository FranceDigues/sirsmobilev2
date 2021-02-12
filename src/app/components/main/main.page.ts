import { AfterViewInit, Component } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { LoadingController, MenuController, Platform } from '@ionic/angular';
import { LongClickSelect } from '@plugins/LongClickSelect.js';
import { transform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import { Fill, Style } from 'ol/style';
import proj4 from 'proj4';
import { AppVersionsService } from '../../services/app-versions.service';
import { AuthService } from '../../services/auth.service';
import { BackLayerService } from '../../services/back-layer.service';
import { DatabaseService } from '../../services/database.service';
import { GeolocationService } from '../../services/geolocation.service';
import { AppLayer, BackLayer, EditionLayer, GeolocLayer } from '../../services/layers.service';
import { MapService } from '../../services/map.service';
import { DatabaseModel } from '../database-connection/models/database.model';
import { SelectedObjectsService } from '../../services/selected-objects.service';
import { SirsDocService } from '../../services/sirsdoc.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {

    navbarController = true; // ? mb remove bcs unused

    pathRightSlide = 'objectsCreation';

    constructor(private ol: OLService, private backLayerService: BackLayerService, public geoloc: GeolocationService,
                public editionLayer: EditionLayer, private geolocLayer: GeolocLayer, private sirsDocSrvc: SirsDocService,
                private mapService: MapService, private appLayer: AppLayer, private authService: AuthService,
                private menu: MenuController, private appVersionsService: AppVersionsService, private backLayer: BackLayer,
                private loadingCtrl: LoadingController, private platform: Platform, private dbService: DatabaseService,
                private selectedObjectsService: SelectedObjectsService) {
        this.appVersionsService.init();
        this.backLayer.init();
        this.appLayer.init();
        this.editionLayer.init();
        this.geolocLayer.init();
        this.platform.pause.subscribe(
            async () => {
                const currentView = this.mapService.currentView;
                if (currentView) {
                    this.dbService.getCurrentDatabaseHardDisk().then(
                        (db: DatabaseModel) => {
                            db.context.currentView = {
                                zoom: this.ol.map.getView().getZoom(),
                                coords: this.ol.map.getView().getCenter()
                            };
                            this.dbService.updateCurrentDatabaseHardDisk(db);
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
                    this.ol.getMap().addInteraction(new LongClickSelect({
                        circleStyle: new Style({
                            fill: new Fill({color: [255, 255, 255, 0.5]})
                        }),
                        layers: (olLayer) => {
                            // TODO
                            return true;
                        },
                        endClick: (features) => {
                            // If there is at least one object selected
                            if (features.length > 0) {
                                this.pathRightSlide = 'objectsSelected';
                                this.selectedObjectsService.updateFeatures(features);
                                this.menu.open('right-slider');
                            }
                            return true;
                        }
                    }));
                    setTimeout(() => {
                        loading.dismiss();
                    }, 1600);
                }
            );
    }

    locateMe() {
        this.geoloc.getCurrentLocation()
            .then(
                (result) => {
                    this.zoomToMe();
                },
                (error) => {
                    console.error('Error getting location', error);
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
                        this.pathRightSlide = 'trait-berge';
                    } else {
                        this.pathRightSlide = 'trait-berge';
                        this.menu.open('right-slider');
                    }
                }
            );
    }

}
