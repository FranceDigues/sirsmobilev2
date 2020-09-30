import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import { SirsDocService } from 'src/app/sirsdoc.service';
import { EditObjectService } from '../../../../editobjects.service';
import DragPan from 'ol/interaction/DragPan';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import MultiPoint from 'ol/geom/MultiPoint';
import LineString from 'ol/geom/LineString';
import { GeolocService } from '../../../../geoloc.service';
import { GeolocLayer } from '../../../../layers.service';
import WKT from 'ol/format/WKT';
import Polygon from 'ol/geom/Polygon';
import { Toast } from '@ionic-native/toast/ngx';
import { LongClickSelect } from '@plugins/LongClickSelect.js';

@Component({
  selector: 'map-polygon',
  templateUrl: './map-polygon.component.html',
  styleUrls: ['./map-polygon.component.scss'],
})
export class MapPolygonComponent implements OnInit, AfterViewInit {

  defaultVisibleValueArrayLayer = [];
  @Output() readonly slidePathChange = new EventEmitter<string>();
  vector = null;
  source = null;
  draw = null;
  pan = null;
  modify = null;
  snap = null;

  constructor(public olService: OLService,
              public EOS: EditObjectService, private sirsDoc: SirsDocService,
              private geoloc: GeolocService, private geolocLayer: GeolocLayer,
              private toast: Toast) { }

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

  ngOnInit() {
    const arrayLayer = this.olService.getLayers();
    this.defaultVisibleValueArrayLayer = Object.assign([], arrayLayer);
    arrayLayer[0].setVisible(true); // BackLayer
    arrayLayer[1].setVisible(false);
    arrayLayer[2].setVisible(false);
    arrayLayer[3].setVisible(true); // GeolocLayer
    this.source = new VectorSource();
    this.vector = new VectorLayer({
      source: this.source,
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
    this.olService.addLayer(this.vector);
    this.removeLongClickSelect();
    this.addInteraction();
    if (this.EOS.objectDoc.geometry) {
      const array = this.getPolygonCoords(this.EOS.objectDoc.geometry);
      this.source.addFeatures(
        [
          new Feature({
            geometry: new Polygon([array])
          }),
          new Feature({
            geometry: new MultiPoint(array)
          })
        ]
      );
    }
    this.initListener();
  }

  ngAfterViewInit(): void {
    this.olService.map.setTarget('mapPolygon');
  }

  initListener() {
    this.draw.on('drawstart', (evt) => {
      if (this.source.getFeatures().length > 0 &&
      this.source.getFeatures()[0].getGeometry().getType() === 'Polygon') { // Clear source to redraw
        this.source.clear();
      }
    });
  }

  closePolygon() {
    const array = [];
    const features = this.source.getFeatures();

    if (features.length < 3) {
      this.toast.showLongTop('Vous devez placer au moins 3 points').subscribe();
      return;
    }
    for (let i = 0; i < features.length; i++) {
      array.push(features[i].getGeometry().getCoordinates());
    }
    this.source.clear();
    console.log(array);
    this.source.addFeatures(
      [
        new Feature({
          geometry: new Polygon([array])
        }),
        new Feature({
          geometry: new MultiPoint(array)
        })
      ]
    );
  }

  goBack() {
    const arrayLayer = this.olService.getLayers();
    arrayLayer[0].setVisible(true);
    arrayLayer[1].setVisible(this.defaultVisibleValueArrayLayer[1]);
    arrayLayer[2].setVisible(this.defaultVisibleValueArrayLayer[2]);
    arrayLayer[3].setVisible(this.defaultVisibleValueArrayLayer[3]);
    this.olService.removeLayer(this.vector);
    this.olService.map.removeInteraction(this.draw);
    this.olService.map.removeInteraction(this.pan);
    this.olService.map.setTarget('map');
    this.slidePathChange.emit('form');
  }

  validate() {
    if (this.source.getFeatures()[0].getGeometry().getType() !== 'Polygon') {
      this.toast.showLongTop('Vous devez fermer un polygone').subscribe();
      return;
    }
    if (!this.source || this.source.getFeatures().length <= 0) {
      this.toast.showLongTop('Vous devez définir un polygon');
      return;
    }
    console.log(this.source);
    const wktFormat = new WKT();
    const geometry = this.source.getFeatures()[0].getGeometry();
    this.EOS.objectDoc.geometry = wktFormat.writeGeometry(geometry);
    this.goBack();
    return;
  }

  addInteraction() {
    this.draw = new Draw({
      source: this.source,
      type: 'Point',
      style: new Style()
    });
    this.pan = new DragPan();
    this.olService.map.addInteraction(this.pan);
    this.olService.map.addInteraction(this.draw);
  }

  getPolygonCoords(position) {
    let array = [];
    position = position.substring(9, position.length - 2);
    let tmp = position.split(',');
    for (let i = 0; i < tmp.length; i++) {
        array.push(tmp[i].split(' '));
    }
    for (let i = 0; i < array.length; i++) {
        for (let y = 0; y < array[i].length; y++) {
            array[i][y] = parseFloat(array[i][y]);
        }
    }
    return array;
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

}
