import { Injectable, Injector } from '@angular/core';
import { MapService } from './map.service';
import MultiPoint from 'ol/geom/MultiPoint';
import { Stroke, Text, Fill, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { features } from 'process';

@Injectable({
    providedIn: 'root'
})
export class DefaultStyle {

    constructor(private handling: HandlingStyle, private getStyle: GetStyle) { }

    style(selection, feature, color?, type?, featureModel?, layerModel?) {
        switch(type) {
            case 'LineString':
            case 'MultiLineString':
                return this.createLineStyle(selection, feature, color, featureModel, layerModel);
            case 'Point':
            case 'MultiPoint':
                return this.createPointStyle(selection, feature, color, featureModel, layerModel);
            case 'Polygon':
            case 'MultiPolygon':
                return this.createPolygonStyle(selection, feature, color, featureModel, layerModel);
        }
        return null;
    }

    private createPointStyle(selection, feature, color?, featureModel?, layerModel?) {
        let selectedIds = this.getAllSelectedFeaturesIds(selection.list);

        color[3] = 1;
        if (selection.active) {
            const highlight = this.handling.highlightHandling(selection, feature);
            const fillColor = highlight ? [255, 0, 0, 1] : [255, 255, 255, color[3]];
            const strokeColor = highlight ? [0, 0, 255, 1] : color;
            const strokeWidth = 2;
            const pointRadius = 6;
            return [this.getStyle.point(fillColor, strokeColor, strokeWidth, pointRadius,
                this.handling.zIndexHandling(selection, feature), featureModel, layerModel)];
        } else {
            const highlightAll = this.handling.allHighlightHandling(feature, selectedIds);
            const fillColor = highlightAll ? [255, 0, 0, 1] : [255, 255, 255, color[3]];
            const strokeColor = highlightAll ? [0, 0, 255, 1] : color;
            const strokeWidth = 2;
            const pointRadius = 6;
            return [this.getStyle.point(fillColor, strokeColor, strokeWidth, pointRadius,
                this.handling.zIndexHandling(selection, feature), featureModel, layerModel)];
        }
    }

    private createLineStyle(selection, feature, color?, featureModel?, layerModel?) {
        let styles = [];
        color[3] = this.handling.opacityHandling(selection, feature);
        const highlight = this.handling.highlightHandling2(selection, feature);
        const zIndex = this.handling.zIndexHandling(selection, feature);
        const strokeColor = color;
        const strokeWidth = 5;
        if (highlight) {
            styles.push(this.getStyle.line([255, 255, 255, color[3]], strokeWidth + 4, [20, 30], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.line(strokeColor, strokeWidth + 4, [30, 20], zIndex, featureModel, layerModel));
        return features;
    }

    private createPolygonStyle(selection, feature, color?, featureModel?, layerModel?) {
        color[3] = this.handling.opacityHandling(selection, feature);

        let styles = [];
        const highlight = this.handling.highlightHandling2(selection, feature);
        const zIndex = this.handling.zIndexHandling(selection, feature);
        const strokeColor = color;
        const strokeWidth = 5;
        if (highlight) {
            styles.push(this.getStyle.polygon([255, 255, 255, color[3]], strokeWidth + 4, [20, 30], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.polygon(strokeColor, strokeWidth, [30, 20], zIndex, featureModel, layerModel));
        return styles;
    }

    private getAllFeaturesIds(arrs) {
        let ids = [];

        arrs.forEach((arr) => {
            ids.push(arr.get('id'));
        });
        return ids;
    }

    private getAllSelectedFeaturesIds(arrs) {
        let ids = [];

        arrs.forEach((arr) => {
            arr.get('features').forEach((feature) => {
                ids.push(feature.get('id'));
            });
        });
        return ids;
    }

}

@Injectable({
    providedIn: 'root'
})
export class RealPositionStyle {

    mapService: MapService;

    constructor(private getStyle: GetStyle, private handling: HandlingStyle) { }

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
        let highlight = this.handling.highlightHandling2(selection, feature);
        let fillColor = highlight ? color : [255, 255, 255, color[3]];
        let strokeColor = highlight ? [255, 255, 255, color[3]] : color;
        const strokeWidth = 2;
        const circleRadius = 6;

        return [this.getStyle.point(fillColor, strokeColor, strokeWidth, circleRadius,
            this.handling.zIndexHandling(selection, feature), featureModel, layerModel)];
    }

    private createLineStyle(selection, feature, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.handling.opacityHandling(selection, feature);
        let styles = [];
        let highlight = this.handling.highlightHandling2(selection, feature);
        let zIndex = this.handling.zIndexHandling(selection, feature);
        let pointFillColor = highlight ? color : [255, 255, 255, color[3]];
        let pointStrokeColor = highlight ? [255, 255, 255, color[3]] : color;
        let pointStrokeWidth = 2;
        let pointCircleRadius = 6;
        let lineStrokeColor = color;
        let lineStrokeWidth = 3;

        if (highlight) {
            styles.push(this.getStyle.line([255, 255, 255, color[3]], lineStrokeWidth + 4, [20, 30], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.line(lineStrokeColor, lineStrokeWidth, [30, 20], zIndex, featureModel, layerModel));
        let pointStyle = this.getStyle.point(pointFillColor, pointStrokeColor, pointStrokeWidth,
            pointCircleRadius, zIndex, featureModel, layerModel);
        pointStyle.setGeometry(
            (feature) => {
                return new MultiPoint(feature.getGeometry().getCoordinates());
            }
        );
        styles.push(pointStyle);
        return styles;
    }

    private createPolygonStyle(selection, feature, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.handling.opacityHandling(selection, feature);
        let styles = [];
        let highlight = this.handling.highlightHandling2(selection, feature)
        let zIndex = this.handling.zIndexHandling(selection, feature)
        let lineStrokeColor = color
        const lineStrokeWidth = 3;

        if (highlight) {
            styles.push(this.getStyle.polygon([255, 255, 255, color[3]], lineStrokeWidth + 4, [20, 30], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.polygon(lineStrokeColor, lineStrokeWidth, [30, 20], zIndex, featureModel, layerModel));
        return styles;
    }
}

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
            if (selectedIds.indexOf(feature.get('id')) !== -1) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    zIndexHandling(selection, feature): Number {
        if (feature === selection.active) {
            return 3;
        } else if (feature.get('selected')) {
            return 2;
        } else {
            return 1;
        }
    }

    opacityHandling(selection, feature): Number {
        if (selection.active && feature !== selection.active) {
            return 0.5;
        } else if (selection.list.length && !feature.get('selected')) {
            return 0.5;
        } else {
            return 1;
        }
    }
}

export class GetStyle {

    point(fillColor, strokeColor, strokeWidth, circleRadius, zIndex, featureModel?, layerModel?): Style {
        const fill = new Fill({ color: fillColor });
        const stroke = new Stroke({ color: strokeColor, width: strokeWidth });
        const circle = new CircleStyle({ fill: fill, stroke: stroke, radius: circleRadius });

        if (layerModel) {
            if (layerModel.featLabels) {
                let text = new Text({
                    font: 'bold 12px sans-serif',
                    text: featureModel.title ? featureModel.title : featureModel.designation,
                    offsetY: -12,
                    fill: new Fill({ color: 'black' }),
                    stroke: new Stroke({ color: 'white', width: 0.5 })
                });
                return new Style({ image: circle, zIndex: zIndex, text: text });
            }
        }
        return new Style({ image: circle, zIndex: zIndex });
    }

    line(strokeColor, strokeWidth, lineDash, zIndex, featureModel?, layerModel?): Style {
        let stroke = new Stroke({ color: strokeColor, width: strokeWidth, lineDash: lineDash });

        if (layerModel) {
            if (layerModel.featLabels) {
                let text = new Text({
                    font: 'bold 12px sans-serif',
                    text: featureModel.title ? featureModel.title : featureModel.designation,
                    offsetY: -12,
                    fill: new Fill({ color: 'black' }),
                    stroke: new Stroke({ color: 'white', width: 0.5 })
                });
                return new Style({ stroke: stroke, zIndex: zIndex, text: text });
            }
        }
        return new Style({ stroke: stroke, zIndex: zIndex })
    }

    polygon(strokeColor, strokeWidth, lineDash, zIndex, featureModel?, layerModel?): Style {
        let stroke = new Stroke({ color: strokeColor, width: strokeWidth, lineDash: lineDash });

        if (layerModel) {
            if (layerModel.featLabels) {
                let text = new Text({
                    font: 'bold 12px sans-serif',
                    text: featureModel.title ? featureModel.title : featureModel.designation,
                    offsetY: -12,
                    fill: new Fill({ color: 'black' }),
                    stroke: new Stroke({ color: 'white', width: 0.5 })
                });
                return new Style({ stroke: stroke, zIndex: zIndex, text: text });
            }
        }
        return new Style({ stroke: stroke, zIndex: zIndex });
    }
}
