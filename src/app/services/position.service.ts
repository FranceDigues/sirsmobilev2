import { Injectable } from '@angular/core';

import WKT from 'ol/format/WKT';
import { transform } from 'ol/proj';
import { SirsDocService } from './sirsdoc.service';
import { Coordinates } from '@ionic-native/geolocation/ngx';

@Injectable({
    providedIn: 'root'
})
export class PositionService {
    public wktFormat = new WKT();
    public dataProjection;

    constructor(private sirsDoc: SirsDocService) {
        this.dataProjection = this.sirsDoc.get().epsgCode;
    }

    getLatLongFromWKT(wktGeometry, lastPositionFlag?: boolean) {
        const geometry = this.wktFormat.readGeometry(wktGeometry);
        return transform(lastPositionFlag ? geometry.getLastCoordinate() : geometry.getFirstCoordinate(), this.dataProjection, 'EPSG:4326');
    }

    getWKTFromLatLong(position: Coordinates) {
        const coordinate = transform([position.longitude, position.latitude], 'EPSG:4326', this.dataProjection);
        return `POINT(${coordinate[0]} ${coordinate[1]})`;
    }
}
