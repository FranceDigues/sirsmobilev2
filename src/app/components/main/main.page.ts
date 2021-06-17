import { AfterViewInit, Component } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { LongClickSelect } from '@plugins/LongClickSelect.js';
import proj4 from 'proj4';
import { AppVersionsService } from '../../services/app-versions.service';
import { AuthService } from '../../services/auth.service';
import { BackLayerService } from '../../services/back-layer.service';
import { DatabaseService } from '../../services/database.service';
import { GeolocationService } from '../../services/geolocation.service';
import { MapManagerService, GeolocLayer } from '../../services/map-manager.service';
import { MapService } from '../../services/map.service';
import { DatabaseModel } from '../database-connection/models/database.model';
import { SelectedObjectsService } from '../../services/selected-objects.service';
import { SirsDocService } from '../../services/sirsdoc.service';
import { Network } from '@ionic-native/network/ngx';
import { EditionLayerService } from '../../services/edition-layer.service';
import { ObservationEditService } from 'src/app/services/observation-edit.service';

// OpenLayers
import { transform, fromLonLat } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import { Style, Fill } from 'ol/style';
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import Feature from 'ol/Feature';
import { Circle } from "ol/geom";
import { env } from 'process';
import * as olInteraction from 'ol/interaction';


@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit {
    public pathRightSlide = 'objectsCreation';
    public connectSubscription;
    public disconnectSubscription;

    constructor(private olService: OLService, private backLayerService: BackLayerService, public geolocationService: GeolocationService,
                public editionLayerService: EditionLayerService, private geolocLayer: GeolocLayer, private sirsDocSrvc: SirsDocService,
                private mapService: MapService, private mapManagerService: MapManagerService, private authService: AuthService,
                private menu: MenuController, private appVersionsService: AppVersionsService,
                private loadingCtrl: LoadingController, private platform: Platform, private dbService: DatabaseService,
                private selectedObjectsService: SelectedObjectsService, private network: Network, private toastCtrl: ToastController,
                public OES: ObservationEditService) {
        this.appVersionsService.init();
        this.backLayerService.init();
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

    async ngAfterViewInit() {
        let loading: HTMLIonLoadingElement = null;
        await this.sirsDocSrvc.initializeDoc()
            .then(
                async (sirsDoc: any) => {
                    proj4.defs(sirsDoc.epsgCode, sirsDoc.proj4);
                    register(proj4);
                    await this.authService.isAuth(); // Init authService user value.
                    this.OES.preInit(this.sirsDocSrvc); // OES services needs sirsDocSrvc service to be (pre)init.
                }
            );
        this.backLayerService.init()
            .then(
                async () => {
                    loading = await this.loadingCtrl.create({
                        message: 'Déploiement de la carte en cours'
                    });
                    loading.present();
                    this.olService.createMap('map');
                    this.olService.getMap().setView(this.mapService.currentView);
                    this.olService.addLayer(this.backLayerService.backLayer);
                    if (this.mapManagerService.appLayer) { // This "if" actually needs to happen. Find a clean way to call this.mapManagerService.init(); if not.
                        this.olService.addLayer(this.mapManagerService.appLayer);
                    } else {
                        console.warn("mapManagerService.appLayer is not initialized.");
                    }
                    this.olService.addLayer(this.editionLayerService.editionLayer);
                    this.olService.addLayer(this.geolocLayer.geolocLayer);

                    // TODO : MOVE ALL CODE RELATED TO LONG CLICK CIRCLE IN A SERVICE.
                    // STARTS HERE.

                    // Timing management.
                    let delay; // Store timeout event.
                    let intervalTask; // Store interval event.
                    let longpress = 500; // Milliseconds value set to 500ms, if higher I consider it a long click.

                    // OpenLayers management.
                    let uniqueLayer; // This layer object should be assigned once at a time otherwise if user press multiple fingers on the screen issues may appear.
                    let radius = 50; // radius en mètres.
                    let clickPixel; // Store the coordinates of the click in this variable.

                    // On pointerdown event (hold click) a longpress is awaited. If a longpress is detected and uniqueLayer does not exist
                    // a circle is drawn. This circle then grows as long as the click is hold in the setInterval method (every 1ms).
                    this.olService.getMap().on("pointerdown", (evt) => {
                        delay = setTimeout(longClickEvent, longpress); // Wait 'longpress' milliseconds before firing longClickEvent.
                        clickPixel = evt.coordinates;

                        function longClickEvent() { // Draws the circle as long as the click is hold.

                            if (!uniqueLayer) {
                                var centerLongitudeLatitude = evt.coordinate;
                                uniqueLayer = new VectorLayer({
                                    name: 'CircleInteraction',
                                    source: new VectorSource({
                                        projection: 'EPSG:4326',
                                        features: [new Feature(new Circle(centerLongitudeLatitude, radius))]
                                    }),
                                    style: [
                                        new Style({
                                            fill: new Fill({ color: [255, 255, 255, 0.5] })
                                        })
                                    ]
                                });
                                evt.map.addLayer(uniqueLayer);
    
                                intervalTask = setInterval(() => {
                                    radius += Math.log(evt.map.getView().getZoom())*15; // Make the radius bigger every 5 milliseconds. zoomLevel ratio to make it grow bigger if you're zoomed out.
                                    uniqueLayer.getSource().getFeatures()[0].getGeometry().setRadius(radius);
                                }, 1);
                            }
                        }
                    });

                    // TODO : If the click is stopped then everything is cancelled.
                    this.olService.getMap().on("pointerup", (evt) => {
                        if (uniqueLayer) {
                            const extent = uniqueLayer.getSource().getFeatures()[0].getGeometry().getExtent();

                            // Let's try to get all intersections with layers/features.
                            const circleGeometry = uniqueLayer.getSource().getFeatures()[0].getGeometry();
                            let featuresIntersection = [];
                            let layerGroupOfObjects; // Layer containing all user datas on the map.

                            for (let layer of this.olService.getLayers()) {
                                if (layer.getProperties().name==='Objects') { // name might be : Background / Objects / Edition / Geolocation. Objects is for the layer with added by user representing datas.
                                    layerGroupOfObjects = layer;
                                }
                            }

                            if (layerGroupOfObjects) {
                                for (let vectorLayer of layerGroupOfObjects.getLayersArray()) {
                                    if (vectorLayer.getProperties().model && vectorLayer.getProperties().model.selectable===true) {
                                        if (vectorLayer.getSource().getFeatures() && vectorLayer.getSource().getFeatures().length > 0) {
                                            for (let feature of vectorLayer.getSource().getFeatures()) {
                                                if (circleGeometry.intersectsCoordinate(feature.getGeometry().getCoordinates())) {
                                                    if (feature.getProperties().features) {
                                                        for (let feat of feature.getProperties().features) { // Features may have features in them... May have to do a recursive loop function to get all features.
                                                            featuresIntersection.push(feat);
                                                        }
                                                    } else {
                                                        featuresIntersection.push(feature);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            evt.map.removeLayer(uniqueLayer);
                            uniqueLayer = null;

                            if (featuresIntersection.length > 0) {
                                this.pathRightSlide = 'objectsSelected';
                                this.selectedObjectsService.updateFeatures(featuresIntersection);
                                this.menu.open('right-slider');
                            }
                        }
                        clearInterval(intervalTask);
                        clearTimeout(delay);
                        radius = 50;
                        clickPixel = null;
                    });

                    // If the map is dragged then everything is cancelled.
                    this.olService.getMap().on('pointerdrag', function (evt) {
                        if (uniqueLayer) {
                            evt.map.removeLayer(uniqueLayer);
                            uniqueLayer = null;
                        }
                        clearInterval(intervalTask);
                        clearTimeout(delay);
                        radius = 50;
                        clickPixel = null;
                    })

                    // If the map is zoomed in or out then everything is cancelled.
                    this.olService.getMap().on("moveend", (evt) => {
                        if (uniqueLayer) {
                            evt.map.removeLayer(uniqueLayer);
                            uniqueLayer = null;
                        }
                        clearInterval(intervalTask);
                        clearTimeout(delay);
                        radius = 50;
                        clickPixel = null;
                    });
                    // ENDS HERE.
                    
                    // OLD VERSION OF THE LONGCLICKSELECT CIRCLE.
                    // this.olService.getMap().addInteraction(new LongClickSelect({
                    //     circleStyle: new Style({
                    //         fill: new Fill({color: [255, 255, 255, 0.5]})
                    //     }),
                    //     layers: (olLayer) => {
                    //         // TODO
                    //         console.log("longSelect olLayer : ", olLayer);
                    //         return true;
                    //     },
                    //     endClick: (features) => {
                    //         console.log("endClick features : ", features);
                    //         // If there is at least one object selected
                    //         if (features.length > 0) {
                    //             this.pathRightSlide = 'objectsSelected';
                    //             this.selectedObjectsService.updateFeatures(features);
                    //             this.menu.open('right-slider');
                    //         }
                    //         return true;
                    //     }
                    // }));
                    

                    this.mapManagerService.mapLoadingSubject
                        .subscribe(
                            {complete: () => {
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
                        const map = this.olService.getMap();
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
                        zoom: this.olService.map.getView().getZoom(),
                        coords: this.olService.map.getView().getCenter()
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
