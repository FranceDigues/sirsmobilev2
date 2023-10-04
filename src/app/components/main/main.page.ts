// @ts-nocheck

import { AfterViewInit, ApplicationRef, Component, OnDestroy, OnInit } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AppLayersService } from '../../services/app-layers.service';
import { AuthService } from '../../services/auth.service';
import { BackLayerService } from '../../services/back-layer.service';
import { DatabaseService } from '../../services/database.service';
import { GeolocationService } from '../../services/geolocation.service';
import { MapManagerService } from '../../services/map-manager.service';
import { MapService } from '../../services/map.service';
import { DatabaseModel } from '../database-connection/models/database.model';
import { SelectedObjectsService } from '../../services/selected-objects.service';
import { Network } from '@ionic-native/network/ngx';
import { EditionLayerService } from '../../services/edition-layer.service';
import { GeolocLayerService } from 'src/app/services/geoloc-layer.service';

// OpenLayers
import { transform } from 'ol/proj';
import { Style, Fill } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import ImageSource from 'ol/source/Image';
import LayerGroup from 'ol/layer/Group';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import ScaleLine from 'ol/control/ScaleLine';
import { ShapesLayersManagerService } from 'src/app/services/shapes-layers-manager.service';
import { ToastService } from 'src/app/services/toast.service';
import { ToastNotification } from '../../shared/models/toast-notification.model';
import { LongClickSelect } from '@plugins/LongClickSelect';
import { PluginUtils } from "../../utils/plugin-utils";

@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.scss'],
})
export class MainPage implements AfterViewInit, OnInit, OnDestroy {
    public pathRightSlide = 'objectsCreation';
    public connectSubscription;
    public disconnectSubscription;
    private onGeolocationSubscription: Subscription;
    private mapLoadingSubjectSubscription: Subscription;

    constructor(
        public geolocationService: GeolocationService,
        public editionLayerService: EditionLayerService,
        private olService: OLService,
        private backLayerService: BackLayerService,
        private geoLocLayer: GeolocLayerService,
        private mapService: MapService,
        private mapManagerService: MapManagerService,
        private authService: AuthService,
        private menu: MenuController,
        private loadingCtrl: LoadingController,
        private platform: Platform,
        private dbService: DatabaseService,
        private selectedObjectsService: SelectedObjectsService,
        private network: Network,
        private shapesLayersManagerService: ShapesLayersManagerService,
        private toastService: ToastService,
        private toastController: ToastController,
        private appLayersService: AppLayersService,
        private ref: ApplicationRef) {

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
                // this.saveCurrentView();
                await this.watchDeviceConnection();
            });
    }

    public ngOnInit(): void {
        this.onGeolocationSubscription = this.geolocationService.onPositionUpdated.subscribe((coord) => {
            this.geoLocLayer.redrawGeolocLayer(coord);
        });
    }

    public ngOnDestroy(): void {
        this.olService.getMap().setTarget();
        this.onGeolocationSubscription.unsubscribe();
        this.mapLoadingSubjectSubscription.unsubscribe();
    }

    async watchDeviceConnection() {
        // watch network for a disconnection
        this.connectSubscription = this.network.onConnect()
            .subscribe(async () => {
                // don't forget to show
                this.toastService.show(new ToastNotification('Connexion établie avec succès', 2000, 'top'));
            });
        // watch network for a disconnection
        this.disconnectSubscription = this.network.onDisconnect()
            .subscribe(async () => {
                // don't forget to show
                this.toastService.show(new ToastNotification('Laconnexion a échoué', 2000, 'top'));
            });
    }

    async ngAfterViewInit() {
        //Loading popup
        const loading = await this.loadingCtrl.create({message: 'Initialisation des services en cours'});
        await loading.present();


        this.appLayersService.dbChanged();

        //Loading layers data
        await Promise.all([
            this.backLayerService.init(),
            this.mapManagerService.init(),
            this.editionLayerService.init(),
        ]);
        console.log("All layers are loaded successfully.");
        loading.message = 'Déploiement de la carte en cours';

        this.olService.createMap('map', null, +localStorage.getItem('moveTolerance') || 1);
        this.olService.getMap().setView(this.mapService.currentView);
        this.olService.addLayer(this.backLayerService.backLayer);
        this.olService.addLayer(this.editionLayerService.editionLayer);
        this.olService.addLayer(this.geoLocLayer.getGeolocLayer());
        this.olService.addLayer(this.mapManagerService.appLayer); //Adds data layer to map (points, lines, etc.).
        this.ref.tick();

        //Loading layers from device
        await this.shapesLayersManagerService.init();

        //Unable specific control to the map
        this.addMapControl();

        //Update favorite layers
        this.mapManagerService.clearAll();

        //Update user location
        this.locateMe();

        loading.message = 'Chargement des données du calque d\'édition ... (Cette opération peux durer plusieurs minutes)';

        await this.editionLayerService.setEditionLayerFeatures(this.editionLayerService.editionLayer, this.editionLayerService.favorites);

        //Update favorite layers
        this.mapManagerService.clearAll();
        this.mapLoadingSubjectSubscription = this.mapManagerService.mapLoadingSubject
            .subscribe(
                {
                    complete: () => {
                        loading.dismiss();
                        this.olService.getMap().updateSize();
                        this.olService.getMap().setTarget();
                        window.setTimeout(() => {
                            this.olService.getMap().setTarget('map');
                        }, 200);
                    }
                }
            );
    }

    locateMe() {
        if (this.geolocationService.isEnabled) {
            this.geolocationService.getCurrentLocation()
                .then(
                    (coordinates) => {
                        this.geoLocLayer.redrawGeolocLayer(coordinates);
                    },
                    (error) => {
                        console.error('Error getting location', error);

                        this.geolocationService.openModal('Erreur lors de la localisation GPS', error.message).then();

                        if (error.message === 'Illegal Access') {
                            this.toastService.show(
                                new ToastNotification(
                                    'Accès au GPS impossible. Activer la localisation pour cette application.',
                                    2500,
                                    'top')
                            );
                        } else if (error.message === 'Timeout expired') {
                            this.toastService.show(
                                new ToastNotification(
                                    'La requête a expiré.',
                                    2000,
                                    'top')
                            );
                        }
                    }
                );
        }
    }

    zoomToCurrentLocation() {
        if (this.geolocationService.isEnabled) {
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
                        this.geolocationService.openModal('Erreur lors de la localisation GPS', error.message).then();
                    }
                );
        }
    }

    saveCurrentView() {
        this.dbService.activeDB.context.currentView = {
            zoom: this.olService.getMap().getView().getZoom(),
            coords: this.olService.getMap().getView().getCenter()
        };

        this.dbService.getCurrentDatabaseSettings().then(
            (db: DatabaseModel) => {
                db.context.currentView = {
                    zoom: this.olService.getMap().getView().getZoom(),
                    coords: this.olService.getMap().getView().getCenter()
                };
                this.dbService.setCurrentDatabaseSettings(db)
                    .then(() => console.log('updated map view'));
            }
        );

    }

    private async refresh() {
        const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({
            message: 'Déploiement de la carte en cours'
        });
        loading.present();
        this.backLayerService.syncBackLayer();
        let f = this.editionLayerService.favorites
        this.editionLayerService.updateEditionLayerInstance(f);
        this.mapManagerService.clearAll();
        this.mapManagerService.mapLoadingSubject.subscribe(
            {
                complete: () => loading.dismiss()
            }
        );
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

    private addMapControl() {
        // Timing management.
        let delay; // Store timeout event.
        let intervalTask; // Store interval event.
        let isInitializedEvent = false;

        // OpenLayers management.
        /* This layer object should be assigned once at a time,
         otherwise if user press multiple fingers on the screen issues may appear.
         */
        let uniqueLayer;

        let clickStartTime: number = Date.now();
        // Radius in meter. Starting value equal to the double of the resolution.
        let radius = 2 * this.mapService.getCurrentView().getResolution();
        // Store the coordinates of the click in this variable.
        let clickPixel;
        let pointerIsDown = false; // Flag to limit the number of pointer down to 1.

        this.olService.getMap().addControl(new ScaleLine());

        // On pointerdown event (hold click) a long press is awaited. If a longpress is detected and uniqueLayer does not exist
        // a circle is drawn. This circle then grows as long as the click is hold in the setInterval method (every 1ms).
        // @ts-ignore
        this.olService.getMap().on('pointerdown', (evt) => {
            // check that pointerIsDown is false, so it does not trigger this event more than once at a time.
            if (!pointerIsDown) {
                const longClickEvent = () => { // Draws the circle as long as the click is hold.
                    clickStartTime = Date.now();
                    if (!uniqueLayer) {
                        // @ts-ignore
                        const centerLongitudeLatitude = evt.coordinate;
                        uniqueLayer = new VectorLayer({
                            source: new VectorSource({
                                features: [new Feature(new Circle(centerLongitudeLatitude, radius))]
                            }),
                            style: [
                                new Style({
                                    fill: new Fill({color: [255, 255, 255, 0.5]})
                                })
                            ]
                        });

                        uniqueLayer.set('name', 'CircleInteraction');
                        uniqueLayer.set('projection', 'EPSG:4326');

                        // @ts-ignore
                        evt.map.addLayer(uniqueLayer);

                        intervalTask = setInterval(() => {
                            const currentTime = Date.now();
                            const diffTime = currentTime - clickStartTime;
                            const diffTimePixels = diffTime / 10;
                            /* Make the radius bigger every 5 milliseconds.
                            zoomLevel ratio to make it grow bigger if you're zoomed out.
                             */
                            // @ts-ignore
                            radius = evt.map.getView().getResolution() * diffTimePixels;
                            uniqueLayer.getSource().getFeatures()[0].getGeometry().setRadius(radius);
                        }, 5);
                    }
                };
                pointerIsDown = true;
                // Milliseconds value set to 200ms, if higher I consider it a long click.
                const longPress = +localStorage.getItem('touchSensitivity') || 200;
                // Wait 'longPress' milliseconds before firing longClickEvent.
                delay = setTimeout(longClickEvent, longPress);
                // @ts-ignore
                clickPixel = evt.coordinates;
            }
        });

        // @ts-ignore
        // If the click is stopped then everything is cancelled.
        this.olService.getMap().on('pointerup', (evt) => {
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
                                    // @ts-ignore
                                    callback.call(this, source.getSource());
                                }
                            }
                        }
                    });
                };
                // Identify features which have at least one point in the circle.
                forEachVectorSources(this.olService.getLayers(), source => {
                    source.forEachFeatureIntersectingExtent(circleExtent,  (feature) => {
                        // Handle vegetation sub-title in selected object
                        if (PluginUtils.isVegetationClass(feature.get('@class'))) {
                            feature.setProperties(Object.assign(feature.getProperties(), { 'subTitle': true }))
                        }
                        const properties = feature.getProperties();
                        if (properties.geometry && properties.id && properties['@class']) {
                            // Add feature only in not exist in featuresIntersection
                            const find = featuresIntersection.find(item => item.get('id') === feature.get('id'));
                            if (!find) {
                                featuresIntersection.push(feature);
                            }
                        }
                    });
                });

                // @ts-ignore
                evt.map.removeLayer(uniqueLayer);
                uniqueLayer = null;

                if (featuresIntersection.length > 0) {
                    this.pathRightSlide = 'objectsSelected';
                    this.selectedObjectsService.updateFeatures(featuresIntersection);
                    this.mapService.selection.list = featuresIntersection;
                    this.menu.open('right-slider').then();
                } else {
                    this.selectedObjectsService.updateFeatures([]);
                    this.menu.close('right-slider').then();
                }
            }
            resetCircle();
        });

        // If the map is dragged then everything is cancelled.
        this.olService.getMap().on('pointerdrag', (evt) => {
            if (uniqueLayer) {
                evt.map.removeLayer(uniqueLayer);
                uniqueLayer = null;
            }
            resetCircle();
        });

        // If the map is zoomed in or out then everything is cancelled.
        this.olService.getMap().on('moveend', (evt) => {
            if (uniqueLayer) {
                evt.map.removeLayer(uniqueLayer);
                uniqueLayer = null;
            }
            resetCircle();

            // Save the current extent and zoom level
            if (isInitializedEvent) {
                this.saveCurrentView();
            } else {
                isInitializedEvent = true;
            }

        });

        const resetCircle = () => {
            clearInterval(intervalTask);
            clearTimeout(delay);
            radius = 50;
            clickPixel = null;
            pointerIsDown = false;
        };
    }
}
