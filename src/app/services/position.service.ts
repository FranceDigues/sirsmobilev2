// @ts-nocheck

import { Injectable } from '@angular/core';
import WKT from 'ol/format/WKT';
import { transform } from 'ol/proj';
import { Coordinates } from '@ionic-native/geolocation/ngx';
import { SirsDataService } from './sirs-data.service';
import Point from "ol/geom/Point";
import { Geometry } from "ol/geom";

@Injectable({
    providedIn: 'root'
})
export class PositionService {
    public wktFormat = new WKT();
    public dataProjection;

    constructor(private sirsDataService: SirsDataService) {
        this.sirsDataService.getSirsDoc().then((sirsDoc) => {
                this.dataProjection = sirsDoc.epsgCode;
            },
            (err) => console.error(err));
    }

    getLatLongFromWKT(wktGeometry, lastPositionFlag?: boolean) {
        const geometry  = this.wktFormat.readGeometry(wktGeometry);
        return transform(lastPositionFlag ? (geometry as Point).getLastCoordinate() : (geometry as Point).getFirstCoordinate(), this.dataProjection, 'EPSG:4326');
    }

    getWKTFromLatLong(position: Coordinates) {
        const coordinate = transform([position.longitude, position.latitude], 'EPSG:4326', this.dataProjection);
        return `POINT(${coordinate[0]} ${coordinate[1]})`;
    }
}
