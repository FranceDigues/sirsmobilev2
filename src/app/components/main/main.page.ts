import {AfterViewInit, Component} from '@angular/core';
import {OLService} from '@ionic-lib/lib-map/ol.service';
import {LoadingController, MenuController, Platform, ToastController} from '@ionic/angular';
import proj4 from 'proj4';
import {AppVersionsService} from '../../services/app-versions.service';
import {AuthService} from '../../services/auth.service';
import {BackLayerService} from '../../services/back-layer.service';
import {DatabaseService} from '../../services/database.service';
import {GeolocationService} from '../../services/geolocation.service';
import {MapManagerService} from '../../services/map-manager.service';
import {MapService} from '../../services/map.service';
import {DatabaseModel} from '../database-connection/models/database.model';
import {SelectedObjectsService} from '../../services/selected-objects.service';
import {SirsDocService} from '../../services/sirsdoc.service';
import {Network} from '@ionic-native/network/ngx';
import {EditionLayerService} from '../../services/edition-layer.service';
import {ObservationEditService} from 'src/app/services/observation-edit.service';
import {GeolocLayerService} from 'src/app/services/geoloc-layer.service';

// OpenLayers
import {transform} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import {Style, Fill} from 'ol/style';
import {Vector as VectorSource} from "ol/source";
import {Vector as VectorLayer} from "ol/layer";
import ImageSource from 'ol/source/Image';
import LayerGroup from 'ol/layer/Group';
import Feature from 'ol/Feature';
import {Circle} from "ol/geom";
import ScaleLine from 'ol/control/ScaleLine';
import {ShapesLayersManagerService} from 'src/app/services/shapes-layers-manager.service';
import {ActivatedRoute} from '@angular/router';


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
                public editionLayerService: EditionLayerService,
                private geoLocLayer: GeolocLayerService, private sirsDocService: SirsDocService,
                private mapService: MapService, private mapManagerService: MapManagerService, private authService: AuthService,
                private menu: MenuController, private appVersionsService: AppVersionsService,
                private loadingCtrl: LoadingController, private platform: Platform, private dbService: DatabaseService,
                private selectedObjectsService: SelectedObjectsService, private network: Network, private toastCtrl: ToastController,
                public OES: ObservationEditService, private shapesLayersManagerService: ShapesLayersManagerService,
                private route: ActivatedRoute) {
        sirsDocService.doc = this.route.snapshot.data.sirsDoc;
        this.appVersionsService.init();
        this.backLayerService.init();
        this.editionLayerService.init();
        this.geoLocLayer.init();

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
        proj4.defs(this.sirsDocService.get().epsgCode, this.sirsDocService.get().proj4);
        register(proj4);
        await this.authService.isAuth(); // Init authService user value.
        this.OES.preInit(this.sirsDocService); // OES services needs sirsDocService service to be (pre)init.
        // await this.sirsDocService.initAndGet()
        //     .then(
        //         async (sirsDoc: any) => {
        //             proj4.defs(sirsDoc.epsgCode, sirsDoc.proj4);
        //             register(proj4);
        //             await this.authService.isAuth(); // Init authService user value.
        //             this.OES.preInit(this.sirsDocService); // OES services needs sirsDocService service to be (pre)init.
        //         }
        //     );
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
                    this.olService.addLayer(this.editionLayerService.editionLayer);
                    this.olService.addLayer(this.geoLocLayer.geolocLayer);
                    if (this.mapManagerService.appLayer) { // This "if" actually needs to happen sooner or later to add the appLayer to the map (done in the init function of mapManagerService).
                        this.olService.addLayer(this.mapManagerService.appLayer); // Adds data layer to map (points, lines, etc.).
                    } else {
                        await this.mapManagerService.init();
                    }
                    this.shapesLayersManagerService.init();

                    this.olService.getMap().addControl(new ScaleLine());

                    // TODO : MOVE ALL CODE RELATED TO LONG CLICK CIRCLE IN A SERVICE.
                    // STARTS HERE.

                    // Timing management.
                    let delay; // Store timeout event.
                    let intervalTask; // Store interval event.
                    let longpress = 500; // Milliseconds value set to 500ms, if higher I consider it a long click.

                    // OpenLayers management.
                    let uniqueLayer; // This layer object should be assigned once at a time otherwise if user press multiple fingers on the screen issues may appear.
                    let radius = 2 * this.mapService.getCurrentView().getResolution(); // Radius in meter. Starting value equal to the double of the resolution.
                    let clickPixel; // Store the coordinates of the click in this variable.
                    let pointerIsDown: boolean = false; // Flag to limit the number of pointer down to 1.

                    // On pointerdown event (hold click) a longpress is awaited. If a longpress is detected and uniqueLayer does not exist
                    // a circle is drawn. This circle then grows as long as the click is hold in the setInterval method (every 1ms).
                    this.olService.getMap().on("pointerdown", (evt) => {
                        if (!pointerIsDown) { // check that pointerIsDown is false so it does not trigger this event more than once at a time.
                            const longClickEvent = () => { // Draws the circle as long as the click is hold.

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
                                                fill: new Fill({color: [255, 255, 255, 0.5]})
                                            })
                                        ]
                                    });
                                    evt.map.addLayer(uniqueLayer);

                                    intervalTask = setInterval(() => {
                                        radius += evt.map.getView().getResolution(); // Make the radius bigger every 5 milliseconds. zoomLevel ratio to make it grow bigger if you're zoomed out.
                                        uniqueLayer.getSource().getFeatures()[0].getGeometry().setRadius(radius);
                                    }, 5);
                                }
                            }
                            pointerIsDown = true;
                            delay = setTimeout(longClickEvent, longpress); // Wait 'longpress' milliseconds before firing longClickEvent.
                            clickPixel = evt.coordinates;
                        }
                    });

                    // If the click is stopped then everything is cancelled.
                    this.olService.getMap().on("pointerup", (evt) => {
                        if (uniqueLayer) {

                            const circleGeometry = uniqueLayer.getSource().getFeatures()[0].getGeometry();
                            const circleExtent = circleGeometry.getExtent();
                            const featuresIntersection = [];
                            const forEachVectorSources = (layers, callback) => {
                                layers.forEach((layer) => {
                                    // Treat only visible layer, specially to filter edition layer when it's off
                                    if (layer.getVisible()) {
                                        // This is a group of layers. Call this method recursively.
                                        if (layer instanceof LayerGroup) {
                                            forEachVectorSources(layer.getLayers(), callback);
                                        }
                                        // This is a single layer. Check if this layer should be included.
                                        else if (layer instanceof VectorLayer && layer.get('model') && layer.get('model').selectable) {
                                            const source = layer.getSource();

                                            // Ensure that the layer has a vector source.
                                            if (source instanceof VectorSource) {
                                                callback.call(this, source);
                                            } else if (source instanceof ImageSource) {
                                                callback.call(this, source.getSource());
                                            }
                                        }
                                    }
                                });
                            };
                            // Identify features which have at least one point in the circle.
                            forEachVectorSources(this.olService.getLayers(), (source) => {
                                source.forEachFeatureIntersectingExtent(circleExtent, (feature) => {
                                    const properties = feature.getProperties();
                                    if (properties.geometry && properties.id && properties['@class']) {
                                        featuresIntersection.push(feature);
                                    }
                                });
                            });

                            evt.map.removeLayer(uniqueLayer);
                            uniqueLayer = null;

                            if (featuresIntersection.length > 0) {
                                this.pathRightSlide = 'objectsSelected';
                                this.selectedObjectsService.updateFeatures(featuresIntersection);
                                this.mapService.selection.list = featuresIntersection;
                                this.menu.open('right-slider');
                            } else {
                                this.selectedObjectsService.updateFeatures([]);
                                this.menu.close('right-slider');
                            }
                        }
                        resetCircle();
                    });

                    // If the map is dragged then everything is cancelled.
                    this.olService.getMap().on('pointerdrag', function (evt) {
                        if (uniqueLayer) {
                            evt.map.removeLayer(uniqueLayer);
                            uniqueLayer = null;
                        }
                        resetCircle();
                    });

                    // If the map is zoomed in or out then everything is cancelled.
                    this.olService.getMap().on("moveend", (evt) => {
                        if (uniqueLayer) {
                            evt.map.removeLayer(uniqueLayer);
                            uniqueLayer = null;
                        }
                        resetCircle();
                    });

                    const resetCircle = () => {
                        clearInterval(intervalTask);
                        clearTimeout(delay);
                        radius = 50;
                        clickPixel = null;
                        pointerIsDown = false;
                    };

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

                    this.mapManagerService.clearAll();
                    this.mapManagerService.mapLoadingSubject
                        .subscribe(
                            {
                                complete: () => {
                                    loading.dismiss();
                                }
                            });
                }
            );
        this.locateMe();
    }

    locateMe() {
        this.geolocationService.getCurrentLocation()
            .then(
                (coordinates) => {
                    this.geoLocLayer.redrawGeolocLayer(coordinates);
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
                        this.geoLocLayer.redrawGeolocLayer(coordinates);
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

    refresh() {
        // window.location.reload();
        this.mapManagerService.clearAll();
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
                        this.pathRightSlide = 'trait';
                    } else {
                        this.pathRightSlide = 'trait';
                        this.menu.open('right-slider');
                    }
                }
            );
    }

}
