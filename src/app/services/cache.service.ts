// @ts-nocheck

import { Injectable } from '@angular/core';
import ScaleLine from 'ol/control/ScaleLine';
import { getWidth } from 'ol/extent';
import Feature from 'ol/Feature';
import MultiPoint from 'ol/geom/MultiPoint';
import Polygon, { fromExtent } from 'ol/geom/Polygon';
import { defaults } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { get } from 'ol/proj';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import TileGrid from 'ol/tilegrid/TileGrid';
import { MapService } from 'src/app/services/map.service';
import Point from "ol/geom/Point";

@Injectable({
    providedIn: 'root'
})
export class CacheMapManager {

    targetLayer: TileLayer<any>;

    previousAreaLayer: VectorLayer<any>;

    currentAreaLayer: VectorLayer<any>;

    constructor(private mapService: MapService) {
        this.targetLayer = null;
        this.previousAreaLayer = null;
        this.currentAreaLayer = null;
        const radius = 5;
        const width = 2;

        const previousAreaLayerStyle1 = new Style({
            fill: new Fill({ color: [255, 0, 0, 0.1] }),
            stroke: new Stroke({ color: [255, 0, 0, 1], width: width })
        });
        const previousAreaLayerStyle2 = new Style({
            image: new CircleStyle({
                radius: radius,
                fill: new Fill({ color: [255, 0, 0, 1] })
            }),
            geometry: this.geometryFunctionStyle
        });

        const currentAreaLayerStyle1 = new Style({
            fill: new Fill({ color: [0, 0, 255, 0.1] }),
            stroke: new Stroke({ color: [0, 0, 255, 1], width: width })
        });
        const currentAreaLayerStyle2 = new Style({
            image: new CircleStyle({
                radius: radius,
                fill: new Fill({ color: [0, 0, 255, 1] })
            }),
            geometry: this.geometryFunctionStyle
        });

        this.targetLayer = new TileLayer({});

        this.targetLayer.set('name', 'Target');

        this.previousAreaLayer = new VectorLayer({
            source: new VectorSource(),
            style: [previousAreaLayerStyle1, previousAreaLayerStyle2]
        });

        this.previousAreaLayer.set('name', 'Previous Area');

        this.currentAreaLayer = new VectorLayer({
            source: new VectorSource(),
            style: [currentAreaLayerStyle1, currentAreaLayerStyle2]
        });

        this.currentAreaLayer.set('name', 'Current Area');
    }

    geometryFunctionStyle(feature) {
        // return the coordinates of the first ring of the polygon

        const coordinates = (feature as Feature<Polygon>).getGeometry().getCoordinates()[0];
        return new MultiPoint(coordinates);
    }

    createFeatureInstance(extent) {
        return new Feature({ geometry: fromExtent(extent) });
    }

    buildConfig(): Map {
        return new Map({
            view: this.mapService.currentView,
            layers: [this.targetLayer, this.previousAreaLayer, this.currentAreaLayer],
            controls: [
                new ScaleLine({
                    minWidth: 100
                })
            ],
            target: 'mapCache',
            interactions: defaults({
                altShiftDragRotate: false,
                shiftDragZoom: false
            })
        });
    }

    handleTypesSource(layerModel) {
        switch (layerModel.source.type) {
            case 'OSM':
                return new OSM(layerModel.source);
            case 'TileWMS':
                return new TileWMS(layerModel.source);
            case 'XYZ':
                return new XYZ(layerModel.source);
            default:
                return new OSM({
                    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                });
        }
        ;
    }

    clearTargetLayer() {
        this.targetLayer.setSource(null);
        this.previousAreaLayer.getSource().clear();
        this.currentAreaLayer.getSource().clear();
    }

    setTargetLayer(layerModel) {
        const source = this.handleTypesSource(layerModel);
        this.targetLayer.setSource(source);

        if (layerModel.cache instanceof Object) {
            this.previousAreaLayer.getSource().addFeatures([this.createFeatureInstance(layerModel.cache.extent)]);
        }
    }

    setCurrentArea(extent) {
        this.currentAreaLayer.getSource().clear();
        if (Array.isArray(extent)) {
            this.currentAreaLayer.getSource().addFeature(this.createFeatureInstance(extent));
        }
    }

    getCurrentArea(): Array<number> {
        const feature = this.currentAreaLayer.getSource().getFeatures()[0];
        if (feature instanceof Feature) {
            return feature.getGeometry().getExtent();
        }
        return null;
    }

    countTiles(minZoom, maxZoom) {
        let tileGrid = this.targetLayer.getSource().getTileGrid();

        const extent = this.getCurrentArea();
        let tileCount = 0;

        // In the case the tileGrid not exist use the default tileGrid
        if (!tileGrid) {
            const projExtent = get('EPSG:3857').getExtent();
            const startResolution = getWidth(projExtent) / 256;
            const resolutions = new Array(22);
            for (let i = 0, size = resolutions.length; i < size; ++i) {
                resolutions[i] = startResolution / Math.pow(2, i);
            }
            tileGrid = new TileGrid({
                origin: [0, 0],
                resolutions
            });
        }
        for (let i = minZoom; i <= maxZoom; i++) {
            const tileRange = tileGrid.getTileCoordForCoordAndZ(extent, i);
            tileCount += (tileRange[1] * tileRange[2]);
        }

        return tileCount;
    }

}

@Injectable({
    providedIn: 'root'
})
export class FeatureCache {

    cache = {};

    put(key, item) {
        this.cache[key] = item;
    }

    get(key) {
        return this.cache[key];
    }

    remove(key) {
        delete this.cache[key];
    }

    removeAll() {
        this.cache = {};
    }

    info() {
        const tmp = Object.keys(this.cache);
        return tmp.length;
    }
}
