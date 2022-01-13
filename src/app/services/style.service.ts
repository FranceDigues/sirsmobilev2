import {Injectable} from '@angular/core';
import MultiPoint from 'ol/geom/MultiPoint';
import {Fill, Stroke, Style, Text} from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import {features} from 'process';
import {MapService} from './map.service';

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

    private createPolygonStyle(selection, feature, color?, featureModel?, layerModel?) {
        color[3] = this.handling.opacityHandling(selection, feature);

        const styles = [];
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
            (featureGeo) => {
                return new MultiPoint(featureGeo.getGeometry().getCoordinates());
            }
        );
        styles.push(pointStyle);
        return styles;
    }

    private createPolygonStyle(selection, feature, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.handling.opacityHandling(selection, feature);
        const styles = [];
        const highlight = this.handling.highlightHandling2(selection, feature);
        const zIndex = this.handling.zIndexHandling(selection, feature);
        const lineStrokeColor = color;
        const lineStrokeWidth = 3;

        if (highlight) {
            styles.push(this.getStyle.polygon([255, 255, 255, color[3]], lineStrokeWidth + 4, [20, 30], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.polygon(lineStrokeColor, lineStrokeWidth, [30, 20], zIndex, featureModel, layerModel));
        return styles;
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

    polygon(strokeColor, strokeWidth, lineDash, zIndex, featureModel?, layerModel?): Style {
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
}
