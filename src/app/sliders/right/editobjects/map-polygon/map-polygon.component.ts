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
import { MapEditObjectService } from 'src/app/mapeditobject.service';

@Component({
  selector: 'map-polygon',
  templateUrl: './map-polygon.component.html',
  styleUrls: ['./map-polygon.component.scss'],
})
export class MapPolygonComponent implements OnInit, AfterViewInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();
  vector = null;
  source = null;
  draw = null;
  pan = null;
  modify = null;
  snap = null;
  arrayPoints = [];

  constructor(public olService: OLService, public EOS: EditObjectService,
              private toast: Toast, public mapEditObject: MapEditObjectService) { }


  ngOnInit() {
    this.mapEditObject.initMap();
    this.source = new VectorSource();
    this.vector = this.mapEditObject.createVectorStyle(this.source);
    this.olService.addLayer(this.vector);
    this.mapEditObject.removeLongClickSelect();
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
    this.draw.on('drawend', async (evt) => {
      await this.mapEditObject.timeout(300); // Draw event time is close to 250ms
      this.arrayPoints.push(Object.assign([], evt.feature.getGeometry().getCoordinates()));
    });
  }

  closePolygon() {
    if (this.arrayPoints.length < 3) {
      this.toast.showLongTop('Vous devez placer au moins 3 points').subscribe();
      return;
    }
    this.source.clear();
    this.source.addFeatures(
      [
        new Feature({
          geometry: new Polygon([this.arrayPoints])
        }),
        new Feature({
          geometry: new MultiPoint(this.arrayPoints)
        })
      ]
    );
    this.arrayPoints = [];
  }

  goBack() {
    this.mapEditObject.setDefaultMap();
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
    const array = [];
    position = position.substring(9, position.length - 2);
    const tmp = position.split(',');
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

}
