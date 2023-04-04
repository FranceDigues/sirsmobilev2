// @ts-nocheck

import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { EditObjectService } from '../../../services/edit-object.service';
import DragPan from 'ol/interaction/DragPan';
import Feature from 'ol/Feature';
import { Style } from 'ol/style';
import MultiPoint from 'ol/geom/MultiPoint';
import LineString from 'ol/geom/LineString';
import { Toast } from '@ionic-native/toast/ngx';
import WKT from 'ol/format/WKT';
import { MapEditObjectService } from 'src/app/services/map-edit-object.service';
import {SirsDataService} from "../../../services/sirs-data.service";
import Point from "ol/geom/Point";

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
              public EOS: EditObjectService, private sirsDataService: SirsDataService,
              private toast: Toast, public mapEditObject: MapEditObjectService) { }

  ngOnInit() {
    this.mapEditObject.initMap();
    this.source = new VectorSource();
    this.vector = this.mapEditObject.createVectorStyle(this.source);
    this.olService.addLayer(this.vector);
    this.mapEditObject.removeLongClickSelect();
    this.addInteraction();
    if (this.EOS.isDependance() && this.EOS.objectDoc.geometry) { // If line already exists (Dependance)
      const geometry = this.wktFormat.readGeometry(this.EOS.objectDoc.geometry);
      const coordsStart = transform((geometry as Point).getFirstCoordinate(), this.EOS.dataProjection, 'EPSG:3857');
      const coordsEnd = transform((geometry as Point).getLastCoordinate(), this.EOS.dataProjection, 'EPSG:3857');

      const lineStringGeometry = new LineString([coordsStart, coordsEnd]);
      const lineStringFeature = new Feature({ geometry: lineStringGeometry });

      const multiPointGeometry = new MultiPoint([coordsStart, coordsEnd]);
      const multiPointFeature = new Feature({ geometry: multiPointGeometry });

      this.source.addFeatures(lineStringFeature, multiPointFeature);
    } else if (this.EOS.objectDoc.positionDebut && this.EOS.objectDoc.positionFin) { // If line already exists
      let coordsStart = this.mapEditObject.getCoordsPointAndLine(this.EOS.objectDoc.positionDebut);
      let coordsEnd = this.mapEditObject.getCoordsPointAndLine(this.EOS.objectDoc.positionFin);
      coordsStart = transform(coordsStart, this.sirsDataService.sirsDoc.epsgCode, 'EPSG:3857');
      coordsEnd = transform(coordsEnd, this.sirsDataService.sirsDoc.epsgCode, 'EPSG:3857');

      const lineStringGeometry = new LineString([coordsStart, coordsEnd]);
      const lineStringFeature = new Feature({ geometry: lineStringGeometry });

      const multiPointGeometry = new MultiPoint([coordsStart, coordsEnd]);
      const multiPointFeature = new Feature({ geometry: multiPointGeometry });

      this.source.addFeatures(lineStringFeature, multiPointFeature);
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
      await this.mapEditObject.timeout(300); // Draw event time is close to 250ms
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

    const lineStringGeometry = new LineString(array);
    const lineStringFeature = new Feature({ geometry: lineStringGeometry });

    const multiPointGeometry = new MultiPoint(array);
    const multiPointFeature = new Feature({ geometry: multiPointGeometry });

    this.source.addFeatures(lineStringFeature, multiPointFeature);
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
    if (!this.source || this.source.getFeatures().length <= 0) {
      this.toast.showLongTop('Vous devez placer 2 points').subscribe();
      return;
    }
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

}
