// @ts-nocheck

import { Injectable } from '@angular/core';
import ScaleLine from 'ol/control/ScaleLine';
import {getCenter, getHeight, getWidth} from 'ol/extent.js';
import Feature from 'ol/Feature';
import MultiPoint from 'ol/geom/MultiPoint';
import Polygon, { fromExtent } from 'ol/geom/Polygon';
import { defaults, Modify, Translate } from 'ol/interaction';
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
import { never } from "ol/events/condition";

@Injectable({
    providedIn: 'root'
})
export class CacheMapManager {
    targetLayer: TileLayer<any> = new TileLayer({});
    currentAreaLayer: VectorLayer<any>;
    modifyInteraction : Modify;
    translateInteraction:Translate;

    constructor(private mapService: MapService) {
        this.targetLayer.set('name', 'Target');

        const style = new Style({
            geometry:  (feature)=> {
                const modifyGeometry = feature.get('modifyGeometry');
                return modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
            },
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new Stroke({
                color: '#ffcc33',
                width: 2,
            }),
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({
                    color: '#ffcc33',
                }),
            }),
        });

        this.currentAreaLayer = new VectorLayer({
            source: new VectorSource(),
            style:  (feature)=> {
                const styles = [style];
                const modifyGeometry = feature.get('modifyGeometry');
                const geometry = modifyGeometry
                    ? modifyGeometry.geometry
                    : feature.getGeometry();
                const result = this.calculateCenter(geometry);
                const center = result.center;
                if (center) {
                    styles.push(
                        new Style({
                            geometry: new Point(center),
                            image: new CircleStyle({
                                radius: 4,
                                fill: new Fill({
                                    color: '#ff3333',
                                }),
                            }),
                        })
                    );
                    const coordinates = result.coordinates;
                    if (coordinates) {
                        const minRadius = result.minRadius;
                        const sqDistances = result.sqDistances;
                        const rsq = minRadius * minRadius;
                        const points = coordinates.filter( (coordinate, index) => sqDistances[index] > rsq);
                        styles.push(
                            new Style({
                                geometry: new MultiPoint(points),
                                image: new CircleStyle({
                                    radius: 10,
                                    fill: new Fill({
                                        color: '#33cc33',
                                    }),
                                }),
                            })
                        );
                    }
                }
                return styles;
            },
        });

        this.currentAreaLayer.set('name', 'Current Area');

        const defaultStyle = new Modify({ source: this.currentAreaLayer.getSource() })
            .getOverlay()
            .getStyleFunction();

        this.modifyInteraction = new Modify({
            source: this.currentAreaLayer.getSource(),
            deleteCondition: never,
            insertVertexCondition: never,
            style: (feature) => {
                feature.get('features').forEach(modifyFeature => {
                    const modifyGeometry = modifyFeature.get('modifyGeometry');
                    if (modifyGeometry) {
                        const point = feature.getGeometry().getCoordinates();
                        let modifyPoint = modifyGeometry.point;
                        if (!modifyPoint) {
                            // save the initial geometry and vertex position
                            modifyPoint = point;
                            modifyGeometry.point = modifyPoint;
                            modifyGeometry.geometry0 = modifyGeometry.geometry;
                            // get anchor and minimum radius of vertices to be used
                            const result = this.calculateCenter(modifyGeometry.geometry0);
                            modifyGeometry.center = result.center;
                            modifyGeometry.minRadius = result.minRadius;
                        }

                        const center = modifyGeometry.center;
                        const minRadius = modifyGeometry.minRadius;
                        let dx, dy;
                        dx = modifyPoint[0] - center[0];
                        dy = modifyPoint[1] - center[1];
                        const initialRadius = Math.sqrt(dx * dx + dy * dy);
                        if (initialRadius > minRadius) {
                            const initialAngle = Math.atan2(dy, dx);
                            dx = point[0] - center[0];
                            dy = point[1] - center[1];
                            const currentRadius = Math.sqrt(dx * dx + dy * dy);
                            if (currentRadius > 0) {
                                const currentAngle = Math.atan2(dy, dx);
                                const geometry = modifyGeometry.geometry0.clone();
                                geometry.scale(currentRadius / initialRadius, undefined, center);
                                geometry.rotate(currentAngle - initialAngle, center);
                                modifyGeometry.geometry = geometry;
                            }
                        }
                    }
                });
                // @ts-ignore
                return defaultStyle(feature);
            },
        });

        this.translateInteraction = new Translate({
            layers: [this.currentAreaLayer],
        });

        this.modifyInteraction.on('modifystart', (event) => {
            event.features.forEach(feature => {
                feature.set(
                    'modifyGeometry',
                    { geometry: feature.getGeometry().clone() },
                    true
                );
            });
        });

        this.modifyInteraction.on('modifyend', (event) => {
            event.features.forEach(feature => {
                const modifyGeometry = feature.get('modifyGeometry');
                if (modifyGeometry) {
                    feature.setGeometry(modifyGeometry.geometry);
                    feature.unset('modifyGeometry', true);
                }
            });
        });
    }

    createFeatureInstance(extent) {
        return new Feature({ geometry: fromExtent(extent) });
    }

    calculateCenter(geometry) {
        let center, coordinates, minRadius;
        const type = geometry.getType();
        if (type === 'Polygon') {
            let x = 0;
            let y = 0;
            let i = 0;
            coordinates = geometry.getCoordinates()[0].slice(1);
            coordinates.forEach(function (coordinate) {
                x += coordinate[0];
                y += coordinate[1];
                i++;
            });
            center = [x / i, y / i];
        } else if (type === 'LineString') {
            center = geometry.getCoordinateAt(0.5);
            coordinates = geometry.getCoordinates();
        } else {
            center = getCenter(geometry.getExtent());
        }
        let sqDistances;
        if (coordinates) {
            sqDistances = coordinates.map(function (coordinate) {
                const dx = coordinate[0] - center[0];
                const dy = coordinate[1] - center[1];
                return dx * dx + dy * dy;
            });
            minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3;
        } else {
            minRadius =
                Math.max(
                    getWidth(geometry.getExtent()),
                    getHeight(geometry.getExtent())
                ) / 3;
        }
        return {
            center: center,
            coordinates: coordinates,
            minRadius: minRadius,
            sqDistances: sqDistances,
        };
    }

    buildConfig(): Map {
        return new Map({
            view: this.mapService.currentView,
            layers: [this.targetLayer, this.currentAreaLayer],
            controls: [
                new ScaleLine({
                    minWidth: 100
                })
            ],
            target: 'mapCache',
            interactions: defaults({
                altShiftDragRotate: false,
                shiftDragZoom: false
            }).extend([this.translateInteraction, this.modifyInteraction])
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
    }

    clearTargetLayer() {
        this.targetLayer.setSource(null);
        this.currentAreaLayer.getSource().clear();
    }

    setTargetLayer(layerModel) {
        const source = this.handleTypesSource(layerModel);
        this.targetLayer.setSource(source);
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
