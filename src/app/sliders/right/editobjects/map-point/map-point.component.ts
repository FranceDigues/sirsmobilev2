import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { SirsDocService } from 'src/app/sirsdoc.service';
import { EditObjectService } from 'src/app/editobjects.service';
import DragPan from 'ol/interaction/DragPan';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Style } from 'ol/style';
import WKT from 'ol/format/WKT';
import { MapEditObjectService } from 'src/app/mapeditobject.service';

@Component({
  selector: 'map-point',
  templateUrl: './map-point.component.html',
  styleUrls: ['./map-point.component.scss'],
})
export class MapPointComponent implements OnInit {

  defaultVisibleValueArrayLayer = [];
  @Output() readonly slidePathChange = new EventEmitter<string>();
  @Output() readonly successData = new EventEmitter();
  @Input() readonly notNeedEOS: "true" | undefined;
  draw = null;
  pan = null;
  source = null;
  vector = null;
  wktFormat = new WKT();

  constructor(public olService: OLService,
              private EOS: EditObjectService, private sirsDoc: SirsDocService,
              public mapEditObject: MapEditObjectService) { }

  ngOnInit() {
    this.mapEditObject.initMap();
    this.source = new VectorSource();
    this.vector = this.mapEditObject.createVectorStyle(this.source);
    this.olService.addLayer(this.vector);
    this.mapEditObject.removeLongClickSelect();
    this.addInteraction();
    if (this.notNeedEOS === undefined) {
      if (this.EOS.objectDoc.geometry) {
        const geometry = this.wktFormat.readGeometry(this.EOS.objectDoc.geometry);
        const coords = transform(geometry.getFirstCoordinate(), this.EOS.dataProjection, 'EPSG:3857');
        this.source.addFeatures(
          [new Feature({
            geometry: new Point(coords)
          })]
        );
      } else if (this.EOS.objectDoc.positionDebut) { // If point already exists
        let coords = this.mapEditObject.getCoordsPointAndLine(this.EOS.objectDoc.positionDebut);
        coords = transform(coords, this.sirsDoc.get().epsgCode, 'EPSG:3857');
        this.source.addFeatures(
          [new Feature({
            geometry: new Point(coords)
          })]
        );
      }
    }
    this.initListener();
  }

  ngAfterViewInit(): void {
    this.olService.map.setTarget('mapPoint');
  }

  initListener() {
    this.draw.on('drawstart', () => {
      this.source.clear();
    });
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
      this.goBack();
      return;
    }
    console.log(this.source);
    const coords = this.source.getFeatures()[0].getGeometry().getCoordinates();
    const finalRes = transform(coords, 'EPSG:3857', 'EPSG:4326');
    const args = {
      longitude: finalRes[0],
      latitude: finalRes[1],
      accuracy: -1
    };
    if (this.notNeedEOS !== undefined && this.notNeedEOS === "true") {
      this.successData.emit(args);
    } else {
      if (this.EOS.isDependance()) {
        this.EOS.handlePosDependance(args);
      } else {
        this.EOS.handlePos(args);
      }
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
