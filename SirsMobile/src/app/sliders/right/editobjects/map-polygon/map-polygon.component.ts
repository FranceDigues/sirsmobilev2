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
import WKT from 'ol/format/WKT';
import Polygon from 'ol/geom/Polygon';
import { Toast } from '@ionic-native/toast/ngx';

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

  ngOnInit() {
    let arrayLayer = this.olService.getLayers();
    this.defaultVisibleValueArrayLayer = Object.assign([], arrayLayer);
    arrayLayer[0].setVisible(true); // BackLayer
    arrayLayer[1].setVisible(false);
    arrayLayer[2].setVisible(false);
    arrayLayer[3].setVisible(true); // GeolocLayer
    this.source = new VectorSource();
    this.vector = new VectorLayer({
      source: this.source,
      style: (f) => {
        console.log('f', f);
        console.log(f.getGeometry().getCoordinates());
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
    this.olService.addLayer(this.vector)
    this.addInteraction();
    if (this.EOS.objectDoc.geometry) {
      this.source.addFeatures(
        [new Feature({
          geometry: this.EOS.objectDoc.geometry
        })]
      );
    }
    // if (this.EOS.objectDoc.positionDebut && this.EOS.objectDoc.positionFin) { // If line already exists
    //   let coordsStart = this.getCoords(this.EOS.objectDoc.positionDebut);
    //   let coordsEnd = this.getCoords(this.EOS.objectDoc.positionFin);
    //   coordsStart = transform(coordsStart, this.sirsDoc.get().epsgCode, 'EPSG:3857')
    //   coordsEnd = transform(coordsEnd, this.sirsDoc.get().epsgCode, 'EPSG:3857')
    //   this.source.addFeatures(
    //     [new Feature({
    //       geometry: new LineString([coordsStart, coordsEnd])
    //     })]
    //   );
    // }
    this.initListener();
  }

  ngAfterViewInit(): void {
    this.olService.map.setTarget('mapPolygon');
  }

  callbackSingleClick() {
    if (this.source.getFeatures().length > 0 &&
    this.source.getFeatures()[0].getGeometry().getType() === 'Polygon') {
      this.source.clear();
    }
  }

  initListener() {
    this.olService.map.on('singleclick', this.callbackSingleClick());
    this.draw.on('drawstart', (evt) => {
      if (this.source.getFeatures().length > 0 &&
      this.source.getFeatures()[0].getGeometry().getType() === 'Polygon') {
        this.source.clear();
      }
    });
  }

  closePolygon() {
    let array = [];
    let features = this.source.getFeatures();

    if (features.length < 3) {
      this.toast.showLongTop('Vous devez placer au moins 3 points').subscribe();
      return;
    }
    for (let i = 0; i < features.length; i++) {
      array.push(features[i].getGeometry().getCoordinates())
    }
    this.source.clear();
    console.log(array)
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
    let arrayLayer = this.olService.getLayers();
    arrayLayer[0].setVisible(true);
    arrayLayer[1].setVisible(this.defaultVisibleValueArrayLayer[1]);
    arrayLayer[2].setVisible(this.defaultVisibleValueArrayLayer[2]);
    arrayLayer[3].setVisible(this.defaultVisibleValueArrayLayer[3]);
    this.olService.removeLayer(this.vector);
    this.olService.map.removeInteraction(this.draw);
    this.olService.map.removeInteraction(this.pan);
    this.olService.map.setTarget('map');
    this.olService.map.un('singleclick', this.callbackSingleClick)
    this.slidePathChange.emit('form');
  }

  validate() {
    if (this.source.getFeatures()[0].getGeometry().getType() !== 'Polygon') {
      this.toast.showLongTop('Vous devez fermer un polygone').subscribe();
      return;
    }
    if (!this.source || this.source.getFeatures().length <= 0) {
      this.goBack();
      return;
    }
    console.log(this.source);
    let wktFormat = new WKT();
    const geometry = this.source.getFeatures()[0].getGeometry();
    this.EOS.objectDoc.geometry = wktFormat.writeGeometry(geometry);
    // const coordsStart = transform(arrayOfArrayCoords[0], 'EPSG:3857', 'EPSG:4326');
    // const coordsEnd = transform(arrayOfArrayCoords[1], 'EPSG:3857', 'EPSG:4326');
    // const argsStart = {
    //   longitude: coordsStart[0],
    //   latitude: coordsStart[1],
    //   accuracy: -1
    // };
    // const argsEnd = {
    //   longitude: coordsEnd[0],
    //   latitude: coordsEnd[1],
    //   accuracy: -1
    // };
    // if (this.EOS.isDependance()) {
    //   this.EOS.handlePosDependance(argsStart)
    //   this.EOS.handlePosDependanceEnd(argsEnd);
    // } else {
    //   this.EOS.handlePos(argsStart, argsEnd);
    // }
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
    )
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
