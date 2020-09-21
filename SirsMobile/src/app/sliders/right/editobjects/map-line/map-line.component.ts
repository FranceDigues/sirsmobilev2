import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OLService } from '@lib-map/ol.service';
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
import { Toast } from '@ionic-native/toast/ngx';
import WKT from 'ol/format/WKT';

@Component({
  selector: 'map-line',
  templateUrl: './map-line.component.html',
  styleUrls: ['./map-line.component.scss'],
})
export class MapLineComponent implements OnInit, AfterViewInit {

  defaultVisibleValueArrayLayer = [];
  @Output() readonly slidePathChange = new EventEmitter<string>();
  vector = null;
  source = null;
  draw = null;
  pan = null;
  modify = null;
  snap = null;
  wktFormat = new WKT();

  constructor(public olService: OLService,
              public EOS: EditObjectService, private sirsDoc: SirsDocService,
              private geoloc: GeolocService, private geolocLayer: GeolocLayer,
              private toast: Toast) { }

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
    this.addInteraction();
    if (this.EOS.isDependance() && this.EOS.objectDoc.geometry) { // If line already exists (Dependance)
      const geometry = this.wktFormat.readGeometry(this.EOS.objectDoc.geometry);
      let coordsStart = transform(geometry.getFirstCoordinate(), this.EOS.dataProjection, 'EPSG:3857');
      let coordsEnd = transform(geometry.getLastCoordinate(), this.EOS.dataProjection, 'EPSG:3857');
      this.source.addFeatures(
        [
          new Feature({
            geometry: new LineString([coordsStart, coordsEnd])
          }),
          new Feature({
            geometry: new MultiPoint([coordsStart, coordsEnd])
          })
        ]
      );
    } else if (this.EOS.objectDoc.positionDebut && this.EOS.objectDoc.positionFin) { // If line already exists
      let coordsStart = this.getCoords(this.EOS.objectDoc.positionDebut);
      let coordsEnd = this.getCoords(this.EOS.objectDoc.positionFin);
      coordsStart = transform(coordsStart, this.sirsDoc.get().epsgCode, 'EPSG:3857');
      coordsEnd = transform(coordsEnd, this.sirsDoc.get().epsgCode, 'EPSG:3857');
      this.source.addFeatures(
        [
          new Feature({
            geometry: new LineString([coordsStart, coordsEnd])
          }),
          new Feature({
            geometry: new MultiPoint([coordsStart, coordsEnd])
          })
        ]
      );
    }
    this.initListener();
  }

  ngAfterViewInit(): void {
    this.olService.map.setTarget('mapLine');
  }

  initListener() {
    this.draw.on('drawstart', () => {
      if (this.source.getFeatures().length > 0 &&
      this.source.getFeatures()[0].getGeometry().getType() === 'LineString') { // Clear source to redraw
        this.source.clear();
      }
    });
    this.draw.on('drawend', async () => {
      await setTimeout(() => {}, 300);
      if (this.source.getFeatures().length === 2 && this.source.getFeatures()[0].getGeometry().getType() === 'Point' && // Create LineString if there is 2 Points
      this.source.getFeatures()[1].getGeometry().getType() === 'Point') {
        this.setLineString();
      }
    });
  }

  setLineString() {
    const array = [];
    const features = this.source.getFeatures();
    for (let i = 0; i < features.length; i++) {
      array.push(features[i].getGeometry().getCoordinates());
    }
    this.source.clear();
    this.source.addFeatures(
      [
        new Feature({
          geometry: new LineString(array)
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
    if (!this.source || this.source.getFeatures().length <= 0) {
      this.toast.showLongTop('Vous devez placer 2 points').subscribe();
      return;
    }
    console.log(this.source);
    const arrayOfArrayCoords = this.source.getFeatures()[0].getGeometry().getCoordinates();
    const coordsStart = transform(arrayOfArrayCoords[0], 'EPSG:3857', 'EPSG:4326');
    const coordsEnd = transform(arrayOfArrayCoords[1], 'EPSG:3857', 'EPSG:4326');
    const argsStart = {
      longitude: coordsStart[0],
      latitude: coordsStart[1],
      accuracy: -1
    };
    const argsEnd = {
      longitude: coordsEnd[0],
      latitude: coordsEnd[1],
      accuracy: -1
    };
    if (this.EOS.isDependance()) {
      this.EOS.handlePosDependance(argsStart);
      this.EOS.handlePosDependanceEnd(argsEnd);
    } else {
      this.EOS.handlePos(argsStart, argsEnd);
    }
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

  getCoords(position) {
    const tmp = position.slice(6, position.length - 1);
    const array = tmp.split(' ');
    return [parseFloat(array[0]), parseFloat(array[1])];
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
