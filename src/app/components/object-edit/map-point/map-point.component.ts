// @ts-nocheck

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { EditObjectService } from 'src/app/services/edit-object.service';
import DragPan from 'ol/interaction/DragPan';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import { MapEditObjectService } from 'src/app/services/map-edit-object.service';
import {SirsDataService} from "../../../services/sirs-data.service";
import { Vector as VectorLayer } from "ol/layer";
import Polygon from 'ol/geom/Polygon';
import { Style, Stroke } from 'ol/style';
import {containsExtent} from 'ol/extent';
import { ToastController } from "@ionic/angular";

@Component({
    selector: 'map-point',
    templateUrl: './map-point.component.html',
    styleUrls: ['./map-point.component.scss'],
})
export class MapPointComponent implements OnInit {
    defaultVisibleValueArrayLayer = [];
    @Output() readonly slidePathChange = new EventEmitter<string>();
    @Output() readonly successData = new EventEmitter();
    @Input() readonly notNeedEOS: 'true' | undefined;
    @Input() isVegetation? = false;
    layerParcelle = null;
    vegetationDrawingLayer = null;
    draw = null;
    pan = null;
    source = null;
    vector = null;
    wktFormat = new WKT();

    constructor(public olService: OLService,
                private toastCtrl: ToastController,
                private EOS: EditObjectService, private sirsDataService: SirsDataService,
                public mapEditObject: MapEditObjectService) {
    }

    ngOnInit() {
        this.mapEditObject.initMap();
        this.source = new VectorSource();
        this.vector = this.mapEditObject.createVectorStyle(this.source);
        this.olService.addLayer(this.vector);
        this.mapEditObject.removeLongClickSelect();
        this.addInteraction();
        if (this.notNeedEOS === undefined) {
            if (this.EOS.objectDoc.geometry) {
                const geometry = this.wktFormat.readGeometry(this.EOS.objectDoc.geometry);
                const coords = transform((geometry as Point).getFirstCoordinate(), this.EOS.dataProjection, 'EPSG:3857');
                this.source.addFeatures(
                    [new Feature({
                        geometry: new Point(coords)
                    })]
                );
            } else if (this.EOS.objectDoc.positionDebut) { // If point already exists
                let coords = this.mapEditObject.getCoordsPointAndLine(this.EOS.objectDoc.positionDebut);
                coords = transform(coords, this.sirsDataService.sirsDoc.epsgCode, 'EPSG:3857');
                this.source.addFeatures(
                    [new Feature({
                        geometry: new Point(coords)
                    })]
                );
            }

            // Handle the case of Vegetation
            if (this.isVegetation) {
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
                                lineDash:[10, 5]
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
        }
        this.initListener();
    }

    ngAfterViewInit(): void {
        this.olService.map.setTarget('mapPoint');
    }

    initListener() {
        this.draw.on('drawstart', () => {
            this.source.clear();
        });
    }

    goBack() {
        this.mapEditObject.setDefaultMap();
        this.olService.removeLayer(this.vector);
        this.olService.map.removeInteraction(this.draw);
        this.olService.map.removeInteraction(this.pan);
        this.olService.map.setTarget('map');
        this.slidePathChange.emit('form');
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

    async validate() {
        if (!this.source || this.source.getFeatures().length <= 0) {
            this.goBack();
            return;
        }
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

        const coords = geometry.getCoordinates();
        const finalRes = transform(coords, 'EPSG:3857', 'EPSG:4326');
        const args = {
            longitude: finalRes[0],
            latitude: finalRes[1],
            accuracy: -1
        };
        this.successData.emit(args);
        if (this.notNeedEOS !== undefined && this.notNeedEOS === 'true') {
            this.successData.emit(args);
        } else {
            if (this.EOS.isDependance()) {
                this.EOS.handlePosDependance(args);
            } else {
                this.EOS.handlePos(args);
            }
        }
        this.goBack();
        return;
    }

    addInteraction() {
        this.draw = new Draw({
            source: this.source,
            type: 'Point',
            style: new Style()
        });
        this.pan = new DragPan();
        this.olService.map.addInteraction(this.pan);
        this.olService.map.addInteraction(this.draw);
    }

}
