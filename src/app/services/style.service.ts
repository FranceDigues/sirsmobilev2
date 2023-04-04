// @ts-nocheck

import { Injectable } from '@angular/core';
import MultiPoint from 'ol/geom/MultiPoint';
import { Fill, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { MapService } from './map.service';
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

@Injectable({
    providedIn: 'root'
})
export class DefaultStyle {

    constructor(private handling: HandlingStyle, private getStyle: GetStyle) {
    }

    style(selection, feature, color?, type?, featureModel?, layerModel?) {
        switch (type) {
            case 'LineString':
                return this.createLineStyleFunc(selection, feature, color, featureModel, layerModel);
            case 'MultiLineString':
                return this.createLineStyleFunc(selection, feature, color, featureModel, layerModel);
            case 'Point':
                return this.createPointStyleFunc(selection, feature, color, featureModel, layerModel);
            case 'MultiPoint':
                return this.createPointStyleFunc(selection, feature, color, featureModel, layerModel);
            case 'Polygon':
                return this.createPolygonStyle(selection, feature, color, featureModel, layerModel);
            case 'MultiPolygon':
                return this.createPolygonStyle(selection, feature, color, featureModel, layerModel);
        }
        return null;
    }

    private createPointStyleFunc(selection, feature, color?, featureModel?, layerModel?) {
        return () => {
            if (selection.active && selection.active === feature) {
                const fillColor = [255, 0, 0, 1];
                const strokeColor = [0, 0, 255, 1];
                const strokeWidth = 2;
                const pointRadius = 6;
                return [this.getStyle.point(fillColor, strokeColor, strokeWidth, pointRadius, 3, featureModel, layerModel)];
            } else if (feature.get('selected')) {
                const fillColor = color;
                const strokeColor = [255, 255, 255, color[3]];
                const strokeWidth = 2;
                const pointRadius = 6;
                return [this.getStyle.point(fillColor, strokeColor, strokeWidth, pointRadius, 2, featureModel, layerModel)];
            } else {
                const fillColor = [255, 255, 255, color[3]];
                const strokeColor = color;
                const strokeWidth = 2;
                const pointRadius = 6;
                return [this.getStyle.point(fillColor, strokeColor, strokeWidth, pointRadius, 1, featureModel, layerModel)];
            }
        };
    }

    private createLineStyleFunc(selection, feature, color, featureModel, layerModel) {
        return () => {
            const styles = [];
            color[3] = 1;
            styles.push(this.createLineStyle(color, 5, 2, featureModel, layerModel));

            if (selection.active && selection.active === feature) {
                styles.push(this.createLineStyle([0, 0, 255, color[3]], 9, 3, featureModel, layerModel));
                styles.push(this.createLineStyle([255, 0, 0, color[3]], 5, 4, featureModel, layerModel));
            } else if (feature.get('selected')) {
                styles.push(this.createLineStyle([255, 255, 255, color[3]], 9, 1, featureModel, layerModel));
            }

            return styles;
        };
    }

    private createLineStyle(strokeColor, strokeWidth, zIndex, featureModel, layerModel) {
        var stroke = new Stroke({color: strokeColor, width: strokeWidth});
        if (layerModel) {
            if (layerModel.featLabels) {
                //
                var text = new Text({
                    font: '12px Verdana',
                    text: featureModel.title ? featureModel.title : featureModel.designation,
                    fill: new Fill({color: 'black'}),
                    stroke: new Stroke({color: 'white', width: 0.5})
                });
                return new Style({stroke: stroke, zIndex: zIndex, text: text});
            }
        }

        return new Style({stroke: stroke, zIndex: zIndex});
    }

    private createPolygonStyle(selection, feature, color, featureModel?, layerModel?) {
        color[3] = this.handling.opacityHandling(selection, feature);

        const styles = [];
        const highlight = this.handling.highlightHandling2(selection, feature);
        const zIndex = this.handling.zIndexHandling(selection, feature);
        if (highlight) {
            styles.push(this.getStyle.polygon([255, 255, 255, color[3]], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.polygon(color, zIndex, featureModel, layerModel));
        return styles;
    }

}

@Injectable({
    providedIn: 'root'
})
export class RealPositionStyle {
    mapService: MapService;

    constructor(private getStyle: GetStyle, private handling: HandlingStyle) {
    }

    style(selection, feature, color?, type?, featureModel?, layerModel?): Array<Style> {
        switch (type) {
            case 'LineString':
                return this.createLineStyle(selection, feature, color, featureModel, layerModel);
            case 'Point':
                return this.createPointStyle(selection, feature, color, featureModel, layerModel);
            case 'Polygon':
                return this.createPolygonStyle(selection, feature, color, featureModel, layerModel);
        }
    }

    private createPointStyle(selection, feature, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.handling.opacityHandling(selection, feature);
        const highlight = this.handling.highlightHandling2(selection, feature);
        const fillColor = highlight ? color : [255, 255, 255, color[3]];
        const strokeColor = highlight ? [255, 255, 255, color[3]] : color;
        const strokeWidth = 2;
        const circleRadius = 6;

        return [this.getStyle.point(fillColor, strokeColor, strokeWidth, circleRadius,
            this.handling.zIndexHandling(selection, feature), featureModel, layerModel)];
    }

    private createLineStyle(selection, feature, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.handling.opacityHandling(selection, feature);
        const styles = [];
        const highlight = this.handling.highlightHandling2(selection, feature);
        const zIndex = this.handling.zIndexHandling(selection, feature);
        const pointFillColor = highlight ? color : [255, 255, 255, color[3]];
        const pointStrokeColor = highlight ? [255, 255, 255, color[3]] : color;
        const pointStrokeWidth = 2;
        const pointCircleRadius = 6;
        const lineStrokeColor = color;
        const lineStrokeWidth = 3;

        if (highlight) {
            styles.push(this.getStyle.line([255, 255, 255, color[3]], lineStrokeWidth + 4, [20, 30], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.line(lineStrokeColor, lineStrokeWidth, [30, 20], zIndex, featureModel, layerModel));
        const pointStyle = this.getStyle.point(pointFillColor, pointStrokeColor, pointStrokeWidth,
            pointCircleRadius, zIndex, featureModel, layerModel);
        pointStyle.setGeometry(
            (featureGeo : Feature<Point>) => {
                return new MultiPoint(featureGeo.getGeometry().getCoordinates());
            }
        );
        styles.push(pointStyle);
        return styles;
    }

    private createPolygonStyle(selection, feature, color, featureModel?, layerModel?): Array<Style> {
        color[3] = this.handling.opacityHandling(selection, feature);
        const styles = [];
        const highlight = this.handling.highlightHandling2(selection, feature);
        const zIndex = this.handling.zIndexHandling(selection, feature);

        if (highlight) {
            styles.push(this.getStyle.polygon([255, 255, 255, color[3]], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.polygon(color, zIndex, featureModel, layerModel));
        return styles;
    }
}

@Injectable({
    providedIn: 'root'
})
export class EditionLayerStyle {
    mapService: MapService;
    EDITION_LAYER_COLOR_1 = [255, 255, 255, .5];
    EDITION_LAYER_COLOR_2 = [0, 0, 255, .5];
    EDITION_LAYER_STROKE_WIDTH = 3;
    EDITION_LAYER_CIRCLE_RADIUS = 6;

    constructor(private getStyle: GetStyle) {
    }

    style(selection, feature, type?, featureModel?, layerModel?) {
        switch (type) {
            case 'LineString':
                return this.createLineStyleFunc(selection, feature, featureModel, layerModel);
            case 'Point':
                return this.createPointStyleFunc(selection, feature, featureModel, layerModel);
            case 'Polygon':
                return this.createPolygonStyleFunc(featureModel, layerModel,
                    feature.get('selected'), selection.active && selection.active === feature);
        }
    }

    tronconStyle() {
        return () => {
            const styles = [];

            styles.push(this.getStyle.line(
                this.EDITION_LAYER_COLOR_2,
                this.EDITION_LAYER_STROKE_WIDTH,
                [30, 20],
                1
            ));
            const pointStyle = this.getStyle.point(
                this.EDITION_LAYER_COLOR_1,
                this.EDITION_LAYER_COLOR_2,
                this.EDITION_LAYER_STROKE_WIDTH,
                this.EDITION_LAYER_CIRCLE_RADIUS,
                2
            );
            pointStyle.setGeometry(
                (featureGeo: Feature<Point>) => {
                    const coordinates = featureGeo.getGeometry().getCoordinates();
                    if (coordinates.length >= 3) {
                        const mpCoords = [coordinates[0], coordinates[coordinates.length - 1]]
                        return new MultiPoint(mpCoords);
                    } else {
                        return new MultiPoint(coordinates);
                    }
                }
            );
            styles.push(pointStyle);
            return styles;
        };
    }

    private createPointStyleFunc(selection, feature, featureModel?, layerModel?) {
        return () => {
            if (selection.active && selection.active === feature) {
                return [this.getStyle.point(
                    [255, 0, 0, 0.3],
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    this.EDITION_LAYER_CIRCLE_RADIUS,
                    1, featureModel, layerModel)];
            } else if (feature.get('selected')) {
                return [this.getStyle.point(
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_COLOR_1,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    this.EDITION_LAYER_CIRCLE_RADIUS,
                    1, featureModel, layerModel)];
            } else {
                return [this.getStyle.point(
                    this.EDITION_LAYER_COLOR_1,
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    this.EDITION_LAYER_CIRCLE_RADIUS,
                    1, featureModel, layerModel)];
            }
        };
    }

    private createLineStyleFunc(selection, feature, featureModel?, layerModel?) {
        return () => {
            const styles = [];

            if (selection.active && selection.active === feature) {
                styles.push(this.getStyle.line(
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    [30, 20], 1, featureModel, layerModel));
                const pointStyle = this.getStyle.point(
                    [255, 0, 0, 0.3],
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    this.EDITION_LAYER_CIRCLE_RADIUS,
                    2, featureModel, layerModel);
                pointStyle.setGeometry(
                    (featureGeo : Feature<Point>) => {
                        return new MultiPoint(featureGeo.getGeometry().getCoordinates());
                    }
                );
                styles.push(pointStyle);
                return styles;

            } else if (feature.get('selected')) {
                styles.push(this.getStyle.line(
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    [30, 20], 1, featureModel, layerModel));
                const pointStyle = this.getStyle.point(
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_COLOR_1,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    this.EDITION_LAYER_CIRCLE_RADIUS,
                    2, featureModel, layerModel);
                pointStyle.setGeometry(
                    (featureGeo : Feature<Point>) => {
                        return new MultiPoint(featureGeo.getGeometry().getCoordinates());
                    }
                );
                styles.push(pointStyle);
                return styles;

            } else {
                styles.push(this.getStyle.line(
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    [30, 20], 1, featureModel, layerModel));
                const pointStyle = this.getStyle.point(
                    this.EDITION_LAYER_COLOR_1,
                    this.EDITION_LAYER_COLOR_2,
                    this.EDITION_LAYER_STROKE_WIDTH,
                    this.EDITION_LAYER_CIRCLE_RADIUS,
                    2, featureModel, layerModel);
                pointStyle.setGeometry(
                    (featureGeo : Feature<Point>) => {
                        return new MultiPoint(featureGeo.getGeometry().getCoordinates());
                    }
                );
                styles.push(pointStyle);
                return styles;
            }
        };
    }

    private createPolygonStyleFunc(featureModel?, layerModel?, selected = false, active = false) {
        return () => {
            return [this.getStyle.polygon(this.EDITION_LAYER_COLOR_2, 1, featureModel, layerModel)];
        };
    }
}

@Injectable()
export class HandlingStyle {

    highlightHandling(selection, feature) {
        return selection.list.length && (selection.active && selection.active === feature);
    }

    highlightHandling2(selection, feature) {
        return selection.list.length && ((!selection.active && feature.get('selected')) ||
            (selection.active && selection.active === feature));
    }

    allHighlightHandling(feature, selectedIds) {
        if (feature.get('features') === undefined) {
            return selectedIds.indexOf(feature.get('id')) !== -1;
        }
        return false;
    }

    zIndexHandling(selection, feature): number {
        if (feature === selection.active) {
            return 3;
        } else if (feature.get('selected')) {
            return 2;
        } else {
            return 1;
        }
    }

    opacityHandling(selection, feature): number {
        if (selection.active && feature !== selection.active) {
            return 0.5;
        } else if (selection.list.length && !feature.get('selected')) {
            return 0.5;
        } else {
            return 1;
        }
    }
}

@Injectable()
export class GetStyle {

    point(fillColor, strokeColor, strokeWidth, circleRadius, zIndex, featureModel?, layerModel?): Style {
        const fill = new Fill({color: fillColor});
        const stroke = new Stroke({color: strokeColor, width: strokeWidth});
        const circle = new CircleStyle({fill, stroke, radius: circleRadius});

        if (layerModel) {
            if (layerModel.featLabels) {
                const text = new Text({
                    font: 'bold 12px sans-serif',
                    text: featureModel.title ? featureModel.title : featureModel.designation,
                    offsetY: -12,
                    fill: new Fill({color: 'black'}),
                    stroke: new Stroke({color: 'white', width: 0.5})
                });
                return new Style({image: circle, zIndex, text});
            }
        }
        return new Style({image: circle, zIndex});
    }

    line(strokeColor, strokeWidth, lineDash, zIndex, featureModel?, layerModel?): Style {
        const stroke = new Stroke({color: strokeColor, width: strokeWidth, lineDash});

        if (layerModel) {
            if (layerModel.featLabels) {
                const text = new Text({
                    font: 'bold 12px sans-serif',
                    text: featureModel.title ? featureModel.title : featureModel.designation,
                    offsetY: -12,
                    fill: new Fill({color: 'black'}),
                    stroke: new Stroke({color: 'white', width: 0.5})
                });
                return new Style({stroke, zIndex, text});
            }
        }
        return new Style({stroke, zIndex});
    }

    polygon(strokeColor, zIndex, featureModel?, layerModel?): Style {
        const fill = new Fill({color: strokeColor});

        if (layerModel) {
            if (layerModel.featLabels) {
                const text = new Text({
                    font: 'bold 12px sans-serif',
                    text: featureModel.title ? featureModel.title : featureModel.designation,
                    offsetY: -12,
                    fill: new Fill({color: 'black'}),
                    stroke: new Stroke({color: 'white', width: 0.5})
                });
                return new Style({fill, zIndex, text});
            }
        }
        return new Style({fill, zIndex});
    }
}
