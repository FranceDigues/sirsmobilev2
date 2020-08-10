import { Injectable, Injector } from '@angular/core';
import { MapService } from './map.service';
import MultiPoint from 'ol/geom/MultiPoint';
import { Stroke, Text, Fill, Style } from 'ol/style';
import * as CircleStyle from 'ol/style/Circle';

@Injectable({
    providedIn: 'root'
})
export class RealPositionStyle {

    mapService: MapService;

    constructor(private injector: Injector, private getStyle: GetStyle) {
        setTimeout(() => {
            this.mapService = injector.get(MapService);
        });
    }

    style(feature?, color?, type?, featureModel?, layerModel?): Array<Style> {
        switch (type) {
            case 'LineString':
                return this.createLineStyle(feature, color, featureModel, layerModel);
            case 'Point':
                return this.createPointStyle(feature, color, featureModel, layerModel);
            case 'Polygon':
                return this.createPolygonStyle(feature, color, featureModel, layerModel);
        }
    }

    private createPointStyle(feature?, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.opacityHandling(feature);
        let highlight = this.highlightHandling(feature);
        let fillColor = highlight ? color : [255, 255, 255, color[3]];
        let strokeColor = highlight ? [255, 255, 255, color[3]] : color;
        const strokeWidth = 2;
        const circleRadius = 6;

        return [this.getStyle.point(fillColor, strokeColor, strokeWidth, circleRadius, this.zIndexHandling(feature), featureModel, layerModel)];
    }

    private createLineStyle(feature?, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.opacityHandling(feature);
        let styles = [];
        let highlight = this.highlightHandling(feature);
        let zIndex = this.zIndexHandling(feature);
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
        let pointStyle = this.getStyle.point(pointFillColor, pointStrokeColor, pointStrokeWidth, pointCircleRadius, zIndex, featureModel, layerModel);
        pointStyle.setGeometry(
            (feature) => {
                return new MultiPoint(feature.getGeometry().getCoordinates());
            }
        );
        styles.push(pointStyle);
        return styles;
    }

    private createPolygonStyle(feature?, color?, featureModel?, layerModel?): Array<Style> {
        color[3] = this.opacityHandling(feature);
        let styles = [];
        let highlight = this.highlightHandling(feature)
        let zIndex = this.zIndexHandling(feature)
        let lineStrokeColor = color
        const lineStrokeWidth = 3;

        if (highlight) {
            styles.push(this.getStyle.polygon([255, 255, 255, color[3]], lineStrokeWidth + 4, [20, 30], zIndex, featureModel, layerModel));
        }
        styles.push(this.getStyle.polygon(lineStrokeColor, lineStrokeWidth, [30, 20], zIndex, featureModel, layerModel));
        return styles;
    }

    private opacityHandling(feature): Number {
        let selection = this.mapService.getSelection;

        if (selection.active && feature !== selection.active) {
            return 0.5;
        } else if (selection.list.length && !feature.get('selected')) {
            return 0.5;
        } else {
            return 1;
        }
    }

    private highlightHandling(feature) {
        let selection = this.mapService.getSelection;

        return selection.list.length && ((!selection.active && feature.get('selected')) || (selection.active && selection.active === feature));
    }

    private zIndexHandling(feature): Number {
        let selection = this.mapService.getSelection;

        if (feature === selection.active) {
            return 3;
        } else if (feature.get('selected')) {
            return 2;
        } else {
            return 1;
        }
    }
}

class GetStyle {

    point(fillColor, strokeColor, strokeWidth, circleRadius, zIndex, featureModel?, layerModel?): Style {
        const fill = new Fill({color: fillColor});
        const stroke = new Stroke({color: strokeColor, width: strokeWidth});
        const circle = new CircleStyle({fill: fill, stroke: stroke, radius: circleRadius});

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
