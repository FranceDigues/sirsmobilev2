import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OLService } from '@lib-map/ol.service';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import { SirsDocService } from 'src/app/sirsdoc.service';
import { EditObjectService } from '../../../../editobjects.service';
import DragPan from 'ol/interaction/DragPan';
import GeoJSON from 'ol/format/GeoJSON';

@Component({
  selector: 'map-point',
  templateUrl: './map-point.component.html',
  styleUrls: ['./map-point.component.scss'],
})
export class MapPointComponent implements OnInit {

  defaultVisibleValueArrayLayer = [];
  @Output() readonly slidePathChange = new EventEmitter<string>();
  draw = null;
  pan = null;
  source = null;
  vector = null;

  constructor(public olService: OLService, private sirsDocSrvc: SirsDocService,
              private EOS: EditObjectService) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.olService.map.setTarget('mapPoint');
    let arrayLayer = this.olService.getLayers();
    this.defaultVisibleValueArrayLayer = Object.assign([], arrayLayer);
    arrayLayer[0].setVisible(true);
    arrayLayer[1].setVisible(false);
    arrayLayer[2].setVisible(false);
    arrayLayer[3].setVisible(false);
    this.source = new VectorSource();
    this.vector = new VectorLayer({
      source: this.source,
    });
    this.olService.addLayer(this.vector)
    this.addInteraction();
    this.draw.on('drawstart', (event) => {
      this.source.clear();
    });
  }

  goBack() {
    const coords = this.source.getFeatures()[0].getGeometry().getCoordinates();
    const finalRes = transform(coords, 'EPSG:3857', 'EPSG:4326');
    this.EOS.startPosBorneLabel = new Promise((resolve) => {
      resolve(finalRes[0].toFixed(3).toString() + ', ' + finalRes[1].toFixed(3).toString());
    });
    let arrayLayer = this.olService.getLayers();
    arrayLayer[0].setVisible(true);
    arrayLayer[1].setVisible(this.defaultVisibleValueArrayLayer[1]);
    arrayLayer[2].setVisible(this.defaultVisibleValueArrayLayer[2]);
    arrayLayer[3].setVisible(this.defaultVisibleValueArrayLayer[2]);
    this.olService.removeLayer(this.vector);
    this.olService.map.removeInteraction(this.draw);
    this.olService.map.removeInteraction(this.pan);
    this.olService.map.setTarget('map');
    this.slidePathChange.emit('form');
  }

  validate() {
    this.goBack();
  }

  addInteraction() {
    this.draw = new Draw({
      source: this.source,
      type: 'Point'
    });
    this.pan = new DragPan();
    this.olService.map.addInteraction(this.pan);
    this.olService.map.addInteraction(this.draw);
  }

}
