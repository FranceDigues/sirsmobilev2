import { Injectable } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { LongClickSelect } from '@plugins/LongClickSelect.js';
import { GeolocService } from './geoloc.service';
import { GeolocLayer } from './layers.service';
import { transform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import MultiPoint from 'ol/geom/MultiPoint';

@Injectable({
    providedIn: 'root'
})
export class MapEditObjectService {

    defaultVisibleValueArrayLayer = [];

    constructor(private olService: OLService, private geoloc: GeolocService,
                private geolocLayer: GeolocLayer) {}

    initMap() {
        const arrayLayer = this.olService.getLayers();

        this.defaultVisibleValueArrayLayer = Object.assign([], arrayLayer);
        arrayLayer[0].setVisible(true); // BackLayer
        arrayLayer[1].setVisible(false);
        arrayLayer[2].setVisible(false);
        arrayLayer[3].setVisible(true); // GeolocLayer
    }

    setDefaultMap() {
        const arrayLayer = this.olService.getLayers();

        arrayLayer[0].setVisible(true);
        arrayLayer[1].setVisible(this.defaultVisibleValueArrayLayer[1]);
        arrayLayer[2].setVisible(this.defaultVisibleValueArrayLayer[2]);
        arrayLayer[3].setVisible(this.defaultVisibleValueArrayLayer[3]);
    }

    removeLongClickSelect() {
        let map = this.olService.getMap();
        let interactions = map.getInteractions().getArray();

        for (let interact of interactions) {
            if (interact instanceof LongClickSelect) {
                map.removeInteraction(interact);
                return;
            }
        }
    }

    createVectorStyle(source) {
        return new VectorLayer({
            source: source,
            style: (f) => {
              if (f.getGeometry().getType() !== 'Point') {
                return [
                  new Style({
                    stroke: new Stroke({ color: '#ffcc33', width: 3 }),
                  }),
                  new Style({
                    image: new Circle({
                      radius: 6,
                      fill: new Fill({
                        color: [255,255,255,0.4]
                      }),
                      stroke: new Stroke({
                        color: [255, 0, 0, 0.7],
                        width: 1.25
                      })
                    }),
                    geometry: new MultiPoint(f.getGeometry().getCoordinates())
                  })
                ];
              } else {
                return new Style({
                  image: new Circle({
                    radius: 6,
                    fill: new Fill({
                      color: [255, 255, 255, 0.4]
                    }),
                    stroke: new Stroke({
                      color: [255, 0, 0, 0.7],
                      width: 1.25
                    })
                  }),
                  zIndex: Infinity
                });
              }
            }
        });
    }

    locateMe() {
        this.geoloc.getCurrentLocation()
        .then(
            () => {
                this.zoomToMe();
            }
        );
    }

    zoomToMe() {
        const coords = this.geoloc.getCoords();
        if (coords) {
            const map = this.olService.getMap();
            map.getView().setCenter(transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'));
            map.getView().setZoom(18);
            this.geolocLayer.redrawGeolocLayer(coords);
        }
    }

    getCoordsPointAndLine(position) {
        const tmp = position.slice(6, position.length - 1);
        const array = tmp.split(' ');
        return [parseFloat(array[0]), parseFloat(array[1])];
    }

    timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
}
