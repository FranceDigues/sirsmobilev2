import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { ToastController } from '@ionic/angular';
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import MultiPoint from 'ol/geom/MultiPoint';
import Polygon from 'ol/geom/Polygon';
import DragPan from 'ol/interaction/DragPan';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import { Style } from 'ol/style';
import { MapEditObjectService } from 'src/app/services/map-edit-object.service';
import { EditObjectService } from '../../../services/edit-object.service';
import { SirsDocService } from 'src/app/services/sirsdoc.service';

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
  arrayPoints: Array<number> = [];

  constructor(public olService: OLService, 
              private sirsDocService: SirsDocService,
              public EOS: EditObjectService,
              private toastCtrl: ToastController, 
              public mapEditObject: MapEditObjectService,
              ) { }


  ngOnInit() {
    this.mapEditObject.initMap();
    this.source = new VectorSource();
    this.vector = this.mapEditObject.createVectorStyle(this.source);
    this.olService.addLayer(this.vector);
    this.mapEditObject.removeLongClickSelect();
    this.addInteraction();
    if (this.EOS.objectDoc.geometry) {
      const array = this.getPolygonCoords(this.EOS.objectDoc.geometry);

      const polygonGeometry = new Polygon([array]);
      const polygonFeature = new Feature({ geometry: polygonGeometry });

      const multiPointGeometry = new MultiPoint(array);
      const multiPointFeature = new Feature({ geometry: multiPointGeometry });

      this.source.addFeatures([polygonFeature, multiPointFeature]);
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

  async closePolygon() {
    if (this.arrayPoints.length < 3) {
      // this.toast.showLongTop('Vous devez placer au moins 3 points').subscribe();
      const toast = await this.toastCtrl.create({
        message: 'Vous devez placer au moins 3 points',
        duration: 1000,
        position: 'top'
      });
      toast.present();
      return;
    }
    this.source.clear();

    // Complete coordinates with the first entered point
    let firstPoint = this.arrayPoints[0]
    this.arrayPoints.push(firstPoint);

    const polygonGeometry = new Polygon([this.arrayPoints]);
    const polygonFeature = new Feature({ geometry: polygonGeometry });

    const multiPointGeometry = new MultiPoint(this.arrayPoints);
    const multiPointFeature = new Feature({ geometry: multiPointGeometry });

    this.source.addFeatures([polygonFeature, multiPointFeature]);
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

  async validate() {
    if (this.source.getFeatures()[0].getGeometry().getType() !== 'Polygon') {
      // this.toast.showLongTop('Vous devez fermer un polygone').subscribe();
      const toast = await this.toastCtrl.create({
        message: 'Vous devez fermer un polygone',
        duration: 1000,
        position: 'top'
      });
      toast.present();
      return;
    }
    if (!this.source || this.source.getFeatures().length <= 0) {
      // this.toast.showLongTop('Vous devez définir un polygon');
      const toast = await this.toastCtrl.create({
        message: 'Vous devez définir un polygon',
        duration: 1000,
        position: 'top'
      });
      toast.present();
      return;
    }

    let dataProjection
    if (!this.sirsDocService.get()) {
      dataProjection = 'EPSG:2154'
    } else {
      if (this.sirsDocService.get().epsgCode) {
        dataProjection = this.sirsDocService.get().epsgCode;
      } else {
        dataProjection = 'EPSG:2154'
      }
    }

    const wktFormat = new WKT();
    const geometry = this.source.getFeatures()[0].getGeometry();
    this.EOS.objectDoc.geometry = wktFormat.writeGeometry(geometry, {dataProjection: dataProjection, featureProjection: 'EPSG:3857'});
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
