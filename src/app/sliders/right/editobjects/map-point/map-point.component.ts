import { Component, EventEmitter, OnInit, Output, enableProdMode } from '@angular/core';
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
import { Style, RegularShape, Fill, Circle} from 'ol/style';
import Stroke from 'ol/style/Stroke';
import MultiPoint from 'ol/geom/MultiPoint';
import WKT from 'ol/format/WKT';
import { LongClickSelect } from '../../../../../lib/plugin/ol/LongClickSelect.js';

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
  wktFormat = new WKT();

  constructor(public olService: OLService,
              private EOS: EditObjectService, private sirsDoc: SirsDocService) { }

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
    arrayLayer[0].setVisible(true);
    arrayLayer[1].setVisible(false);
    arrayLayer[2].setVisible(false);
    arrayLayer[3].setVisible(false);
    this.source = new VectorSource();
    this.vector = new VectorLayer({
      source: this.source,
      style: new Style({
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
      })
    });
    this.olService.addLayer(this.vector);
    this.removeLongClickSelect();
    this.addInteraction();
    if (this.EOS.objectDoc.geometry) {
      const geometry = this.wktFormat.readGeometry(this.EOS.objectDoc.geometry);
      let coords = transform(geometry.getFirstCoordinate(), this.EOS.dataProjection, 'EPSG:3857');
      this.source.addFeatures(
        [new Feature({
          geometry: new Point(coords)
        })]
      );
    } else if (this.EOS.objectDoc.positionDebut) { // If point already exists
      let coords = this.getCoords(this.EOS.objectDoc.positionDebut);
      coords = transform(coords, this.sirsDoc.get().epsgCode, 'EPSG:3857');
      this.source.addFeatures(
        [new Feature({
          geometry: new Point(coords)
        })]
      );
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
    if (this.EOS.isDependance()) {
      this.EOS.handlePosDependance(args);
    } else {
      this.EOS.handlePos(args);
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

}
