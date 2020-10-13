import { Injectable } from '@angular/core';
import ScaleLine from 'ol/control/ScaleLine';
import { getWidth } from 'ol/extent';
import Feature from 'ol/Feature';
import MultiPoint from 'ol/geom/MultiPoint';
import { fromExtent } from 'ol/geom/Polygon';
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
import { MapService } from 'src/app/map.service';

@Injectable({
    providedIn: 'root'
})
export class CacheMapManager {

    targetLayer: TileLayer = null;

    previousAreaLayer: VectorLayer = null;

    currentAreaLayer: VectorLayer = null;

    constructor(private mapService: MapService) {
        const radius = 5;
        const width = 2;

        const previousAreaLayerStyle1 = new Style({
            fill: new Fill({ color: [255, 0, 0, 0.1] }),
            stroke: new Stroke({ color: [255, 0, 0, 1], width: width })
        });
        const previousAreaLayerStyle2 = new Style({
            image: new CircleStyle({
                radius: radius,
                fill: new Fill({color: [255, 0, 0, 1]})
            }),
            geometry: (feature) => {
                this.geometryFunctionStyle(feature);
            }
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
            geometry: (feature) => {
                this.geometryFunctionStyle(feature);
            }
        });

        this.targetLayer = new TileLayer({
            name: 'Target'
        });

        this.previousAreaLayer = new VectorLayer({
            name: 'Previous Area',
            source: new VectorSource(),
            style: [previousAreaLayerStyle1, previousAreaLayerStyle2]
        });

        this.currentAreaLayer = new VectorLayer({
            name: 'Current Area',
            source: new VectorSource(),
            style: [currentAreaLayerStyle1, currentAreaLayerStyle2]
        });
    }

    geometryFunctionStyle(feature) {
        // return the coordinates of the first ring of the polygon

        const coordinates = feature.getGeometry().getCoordinates()[0];
        return new MultiPoint(coordinates);
    }

    createFeatureInstance(extent) {
        return new Feature({ geometry: new fromExtent(extent) });
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
        if (layerModel.source.type === 'OSM') {
        return new OSM(layerModel.source);
        } else if (layerModel.source.type === 'TileWMS') {
            return new TileWMS(layerModel.source);
        } else if (layerModel.source.type === 'XYZ') {
            return new XYZ(layerModel.source);
        } else {
            return new OSM({
                url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            });
        }
    }

    clearTargetLayer() {
        this.targetLayer.setSource(null);
        this.previousAreaLayer.getSource().clear();
        this.currentAreaLayer.getSource().clear();
    }

    setTargetLayer(layerModel) {
        this.targetLayer.setSource(this.handleTypesSource(layerModel));

        if (typeof layerModel.cache === 'object') {
            this.previousAreaLayer.getSource().addFeatures([this.createFeatureInstance(layerModel.cache.extent)]);
        }
    }

    setCurrentArea(extent) {
        this.currentAreaLayer.getSource().clear();
        if (Array.isArray(extent)) {
            this.currentAreaLayer.getSource().addFeature(this.createFeatureInstance(extent));
        }
    }

    getCurrentArea() {
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
            for (let i = 0, j = resolutions.length; i < j; ++i) {
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
