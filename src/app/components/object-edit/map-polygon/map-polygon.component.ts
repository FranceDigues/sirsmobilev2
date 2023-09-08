// @ts-nocheck

import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {OLService} from '@ionic-lib/lib-map/ol.service';
import {ToastController} from '@ionic/angular';
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import Polygon from 'ol/geom/Polygon';
import DragPan from 'ol/interaction/DragPan';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import {MapEditObjectService} from 'src/app/services/map-edit-object.service';
import {EditObjectService} from '../../../services/edit-object.service';
import {SirsDataService} from "../../../services/sirs-data.service";
import {Vector as VectorLayer} from 'ol/layer.js';
import { Style, Stroke } from 'ol/style';
import {containsExtent} from 'ol/extent';

@Component({
    selector: 'map-polygon',
    templateUrl: './map-polygon.component.html',
    styleUrls: ['./map-polygon.component.scss'],
})
export class MapPolygonComponent implements OnInit, AfterViewInit {
    @Input() isVegetation? = false;
    @Output() readonly slidePathChange = new EventEmitter<string>();
    vector = null;
    layerParcelle = null;
    vegetationDrawingLayer = null;
    source = null;
    draw = null;
    pan = null;
    modify = null;
    snap = null;
    wktFormat = new WKT();

    constructor(public olService: OLService,
                private sirsDataService: SirsDataService,
                public EOS: EditObjectService,
                private toastCtrl: ToastController,
                public mapEditObject: MapEditObjectService,
    ) {
    }


    ngOnInit() {
        this.mapEditObject.initMap(this.isVegetation);
        this.source = new VectorSource({wrapX: false});
        this.vector = new VectorLayer({
            source: this.source,
        });
        this.olService.addLayer(this.vector);
        this.mapEditObject.removeLongClickSelect();
        this.addInteraction();
        // Check if the object has a geometry and draw it
        if (this.EOS.objectDoc.geometry) {
            let dataProjection = this.getDataProjection();
            const polygonGeometry = this.wktFormat.readGeometry(this.EOS.objectDoc.geometry, {
                dataProjection,
                featureProjection: 'EPSG:3857'
            });

            const polygonFeature = new Feature(polygonGeometry);
            this.source.addFeature(polygonFeature);
        }
        // Handle the case of Vegetation
        if (this.isVegetation) {
            // Add edition layer to show previous created objects

            const parcelle = this.EOS.parcelles.find(item => item.id === this.EOS.objectDoc.parcelleId);
            if (parcelle?.value?.geometry) {
                const sourceParcelle = new VectorSource({wrapX: false});
                this.layerParcelle = this.mapEditObject.createVectorStyle(sourceParcelle);

                const sourceDrawingArea = new VectorSource({wrapX: false});
                this.vegetationDrawingLayer = new VectorLayer({
                    source: sourceDrawingArea,
                    style: new Style({
                        stroke: new Stroke({
                            color: 'red',
                            width:3,
                            lineDash:[20, 10]
                        }),
                    })
                });

                this.olService.addLayer(this.layerParcelle);
                this.olService.addLayer(this.vegetationDrawingLayer);

                let dataProjection = this.getDataProjection();
                const parcelleGeometry = this.wktFormat.readGeometry(parcelle.value.geometry, {
                    dataProjection,
                    featureProjection: 'EPSG:3857'
                });
                const parcelleFeature = new Feature(parcelleGeometry);
                sourceParcelle.addFeature(parcelleFeature);

                const first = parcelleGeometry.getFirstCoordinate();
                const last = parcelleGeometry.getLastCoordinate();

                // Make a polygon that fit the line of parcelle
                const geometryDrawingArea = new Polygon([
                    [
                        first.map((item, index) => index ? item : item - 1000),
                        first.map((item, index) => index ? item : item + 1000),
                        last.map((item, index) => index ? item : item + 1000),
                        last.map((item, index) => index ? item : item - 1000),
                        first.map((item, index) => index ? item : item - 1000)
                    ]
                ]);

                sourceDrawingArea.addFeature(new Feature(geometryDrawingArea));
                // Zoom to parcelle location
                this.olService.getMap().getView().fit(parcelleGeometry,{size:[500,500]});
            }

        }
        this.initListener();
    }

    private getDataProjection() {
        if (!this.sirsDataService.sirsDoc) {
            return 'EPSG:2154';
        } else {
            if (this.sirsDataService.sirsDoc.epsgCode) {
                return this.sirsDataService.sirsDoc.epsgCode;
            } else {
                return 'EPSG:2154';
            }
        }
    }

    ngAfterViewInit(): void {
        this.olService.map.setTarget('mapPolygon');
    }

    initListener() {
        this.draw.on('drawend', (evt) => {
            // Clear old polygon
            this.source.clear();
        });
    }

    goBack() {
        this.mapEditObject.setDefaultMap();
        this.olService.removeLayer(this.vector);
        if( this.layerParcelle){
            this.olService.removeLayer(this.layerParcelle);
        }
        this.olService.map.removeInteraction(this.draw);
        this.olService.map.removeInteraction(this.pan);
        this.olService.map.setTarget('map');
        this.slidePathChange.emit('form');
    }

    async validate() {
        if (this.source.getFeatures().length === 0) {
            const toast = await this.toastCtrl.create({
                message: 'Vous devez définir un polygone correct',
                duration: 3000,
                position: 'top'
            });
            await toast.present();
        }

        let dataProjection = this.getDataProjection();
        const geometry = this.source.getFeatures()[0].getGeometry();
        // Check if the drawn polygon in the area of percelle
        if (this.isVegetation) {
            const drawingAreaExtent = this.vegetationDrawingLayer.getSource().getFeatures()[0].getGeometry().getExtent();

            if (!containsExtent(drawingAreaExtent, geometry.getExtent())) {
                const toast = await this.toastCtrl.create({
                    message: 'Vous devez définir un polygone dans la zone marquée autour de parcelle sélectionnée',
                    duration: 3000,
                    position: 'top'
                });
                await toast.present();
                return;
            }
        }

        this.EOS.objectDoc.geometry = this.wktFormat.writeGeometry(geometry, {
            dataProjection,
            featureProjection: 'EPSG:3857'
        });
        if(this.isVegetation){
            // Flag to know that the Geometry drawn in the map
            this.EOS.objectDoc.cartoEdited = true;
            this.EOS.objectDoc.geometryMode = 'EXPLICIT';
        }
        this.goBack();
    }

    addInteraction() {
        this.draw = new Draw({
            source: this.source,
            type: 'Polygon'
        });
        this.pan = new DragPan();
        this.olService.map.addInteraction(this.pan);
        this.olService.map.addInteraction(this.draw);
    }

    getPolygonCoords(position) {
        const array = [];
        position = position.substring(9, position.length - 2);
        const tmp = position.split(',');
        for (let i = 0; i < tmp.length; i++) {
            array.push(tmp[i].split(' '));
        }
        for (let i = 0; i < array.length; i++) {
            for (let y = 0; y < array[i].length; y++) {
                array[i][y] = parseFloat(array[i][y]);
            }
        }
        return array;
    }

}
