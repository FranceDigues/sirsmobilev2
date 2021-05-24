import { AfterViewInit, Component } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
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
import { MapManagerService, BackLayer, GeolocLayer } from '../../services/map-manager.service';
import { MapService } from '../../services/map.service';
import { DatabaseModel } from '../database-connection/models/database.model';
import { SelectedObjectsService } from '../../services/selected-objects.service';
import { SirsDocService } from '../../services/sirsdoc.service';
import { Network } from '@ionic-native/network/ngx';
import { EditionLayerService } from '../../services/edition-layer.service';


@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {
    public pathRightSlide = 'objectsCreation';
    public connectSubscription;
    public disconnectSubscription;

    constructor(private ol: OLService, private backLayerService: BackLayerService, public geolocationService: GeolocationService,
                public editionLayerService: EditionLayerService, private geolocLayer: GeolocLayer, private sirsDocSrvc: SirsDocService,
                private mapService: MapService, private mapManagerService: MapManagerService, private authService: AuthService,
                private menu: MenuController, private appVersionsService: AppVersionsService, private backLayer: BackLayer,
                private loadingCtrl: LoadingController, private platform: Platform, private dbService: DatabaseService,
                private selectedObjectsService: SelectedObjectsService, private network: Network, private toastCtrl: ToastController) {
        this.appVersionsService.init();
        this.backLayer.init();
        // this.mapManagerService.init();
        this.editionLayerService.init();
        this.geolocLayer.init();

        this.platform.pause.subscribe(
            () => {
                this.saveCurrentView();
                // stop connect watch
                if (this.connectSubscription) {
                    this.connectSubscription.unsubscribe();
                }
                // stop disconnect watch
                if (this.disconnectSubscription) {
                    this.disconnectSubscription.unsubscribe();
                }
            });

        this.platform.resume.subscribe(
            async () => {
                this.saveCurrentView();
                await this.watchDeviceConnection();
            });
    }

    async watchDeviceConnection() {
        // watch network for a disconnection
        this.connectSubscription = this.network.onConnect()
            .subscribe(async () => {
                const toast = await this.toastCtrl.create({
                    message: 'Connexion établie avec succès',
                    duration: 2000,
                    position: 'top'
                });
                toast.present();
            });
        // watch network for a disconnection
        this.disconnectSubscription = this.network.onDisconnect()
            .subscribe(async () => {
                const toast = await this.toastCtrl.create({
                    message: 'La connexion est échoué',
                    duration: 2000,
                    position: 'top'
                });
                toast.present();
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
                    console.log(1);
                    this.ol.getMap().setView(this.mapService.currentView);
                    console.log(2);
                    this.ol.addLayer(this.backLayer.backLayer);
                    console.log(3);
                    if (this.mapManagerService.appLayer) {
                        this.ol.addLayer(this.mapManagerService.appLayer);
                    }
                    console.log(4);
                    this.ol.addLayer(this.editionLayerService.editionLayer);
                    console.log(5);
                    this.ol.addLayer(this.geolocLayer.geolocLayer);
                    console.log(6);
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

                    console.log(7);
                    this.mapManagerService.mapLoadingSubject
                        .subscribe(
                            {complete: () => {
                                console.log("complete !");
                                loading.dismiss();
                            }
                        });
                }
            );
        this.locateMe();
        this.mapManagerService.init();
    }

    locateMe() {
        this.geolocationService.getCurrentLocation()
            .then(
                (coordinates) => {
                    this.geolocLayer.redrawGeolocLayer(coordinates);
                },
                (error) => {
                    console.error('Error getting location', error);
                }
            );
    }

    zoomToCurrentLocation() {
        this.geolocationService.getCurrentLocation()
            .then(
                (coordinates) => {
                    if (coordinates) {
                        const map = this.ol.getMap();
                        map.getView().setCenter(transform([coordinates.longitude, coordinates.latitude], 'EPSG:4326', 'EPSG:3857'));
                        map.getView().setZoom(18);
                        this.geolocLayer.redrawGeolocLayer(coordinates);
                    }
                },
                (error) => {
                    console.error('Error getting location', error);
                }
            );
    }

    saveCurrentView() {
        const currentView = this.mapService.currentView;
        if (currentView) {
            this.dbService.getCurrentDatabaseSettings().then(
                (db: DatabaseModel) => {
                    db.context.currentView = {
                        zoom: this.ol.map.getView().getZoom(),
                        coords: this.ol.map.getView().getCenter()
                    };
                    this.dbService.setCurrentDatabaseSettings(db);
                }
            );
        }
    }

    // refresh() {
    //     window.location.reload();
    // }

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
