import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { AlertController } from '@ionic/angular';
import { getHeight, getWidth } from 'ol/extent';
import { transformExtent } from 'ol/proj';
import View from 'ol/View';
import { BackLayerService } from 'src/app/backlayer.service';
import { BackLayer } from 'src/app/layers.service';
import { MapService } from 'src/app/map.service';
import { ListBackLayer } from 'src/app/models/database.model';
import { OLService } from '../../../../../../libs/geomatys-ionic-libraries-framework/demo/src/lib/lib-map/ol.service';
import { CacheMapManager } from 'src/app/cache.service';

@Component({
  selector: 'cache',
  templateUrl: './cache.component.html',
  styleUrls: ['./cache.component.scss'],
})
export class LeftSlideCacheComponent implements AfterViewInit, OnDestroy {

  id = null;
  selectedCorner = null;
  minZoom = null;
  maxZoom = null;
  tileCount = 0;
  currentView: View = null;
  layerModel: ListBackLayer = null;
  lastZoom: number = 0;
  knobValues: { lower: number, upper: number } = { lower: 7, upper: 16 };

  constructor(private backLayerService: BackLayerService, private activeRoute: ActivatedRoute,
              private mapService: MapService, private cacheMapManager: CacheMapManager,
              private route: Router, private backLayer: BackLayer, private file: File,
              private alertCtrl: AlertController, private ol: OLService,
              private cdRef: ChangeDetectorRef) {
                this.ol.map = null;

                this.id = this.activeRoute.snapshot.paramMap.get('id');
                this.currentView = this.mapService.currentView;
                this.layerModel = this.backLayerService.getByName(this.id);
                this.lastZoom = this.currentView.getZoom();
                this.minZoom = typeof this.layerModel.cache === 'object' ? this.layerModel.cache.minZoom : 7;
                this.maxZoom = typeof this.layerModel.cache === 'object' ? this.layerModel.cache.maxZoom : 16;
                this.knobValues = {
                  lower: this.minZoom,
                  upper: this.maxZoom
                };

                this.cacheMapManager.setTargetLayer(this.layerModel);

                this.currentView.on('change:center', (event) => this.onCenterChanged(event));
              }

  ngAfterViewInit() {
    this.ol.map = this.cacheMapManager.buildConfig();
    this.setDefaultArea(this.ol.map);
    this.ol.map.updateSize();
  }

  ngOnDestroy(): void {
    this.cacheMapManager.clearTargetLayer();
    this.currentView.un('change:center', this.onCenterChanged);
  }

  goBack() {
    this.route.navigateByUrl('/main');
  }

  updateTileCount() {
    this.minZoom = this.knobValues.lower;
    this.maxZoom = this.knobValues.upper;
    this.tileCount = this.cacheMapManager.countTiles(this.minZoom, this.maxZoom);
    this.cdRef.detectChanges();
  }

  setDefaultArea(map) {
    if (typeof this.layerModel.cache === 'object') {
        // Use previous area.
        this.cacheMapManager.setCurrentArea(this.layerModel.cache.extent);
        this.currentView.fit(this.layerModel.cache.extent, map.getSize());
    } else {
        // Create default area.
        const extent = map.getView().calculateExtent(map.getSize());
        const wDelta = getWidth(extent) / 10;
        const hDelta = getHeight(extent) / 10;
        extent[0] = extent[0] + wDelta;
        extent[1] = extent[1] + hDelta;
        extent[2] = extent[2] - wDelta;
        extent[3] = extent[3] - hDelta;
        this.cacheMapManager.setCurrentArea(extent);
    }
    // Compute the number of tiles.
    this.updateTileCount();
  }

  ifSelectedCorner(status: string) {
    if (this.selectedCorner && this.selectedCorner === status) {
      return true;
    } else {
      return false;
    }
  }

  editCorner(event, corner) {
    event.stopPropagation();
    if (corner === this.selectedCorner) {
        this.selectedCorner = null;
    } else {
        this.selectedCorner = corner;

        // Center view on target corner.
        const extent = this.cacheMapManager.getCurrentArea();
        let center = null;
        switch (corner) {
            case 'tl':
                center = [extent[0], extent[3]];
                break;
            case 'bl':
                center = [extent[0], extent[1]];
                break;
            case 'br':
                center = [extent[2], extent[1]];
                break;
            case 'tr':
                center = [extent[2], extent[3]];
                break;
        }
        this.currentView.setCenter(center);
    }
  }

  getCurrentZoom() {
    const zoom = this.currentView.getZoom();
    if (typeof zoom !== 'undefined') {
        this.lastZoom = zoom;
    }
    return this.lastZoom;
  }

  onCenterChanged(event) {
    if (this.selectedCorner) {
      const extent = this.cacheMapManager.getCurrentArea();
      const center = event.target.getCenter();
      switch (this.selectedCorner) {
          case 'tl':
              extent[0] = center[0];
              extent[3] = center[1];
              break;
          case 'bl':
              extent[0] = center[0];
              extent[1] = center[1];
              break;
          case 'br':
              extent[2] = center[0];
              extent[1] = center[1];
              break;
          case 'tr':
              extent[2] = center[0];
              extent[3] = center[1];
              break;
      }
      this.cacheMapManager.setCurrentArea(extent);
      this.updateTileCount();
    }
  }

  setNewCacheInGoodLayerInBackLayerList(cache) {
    const name = this.backLayerService.getActive().name;

    this.backLayerService.backLayers.list.forEach((backLayer) => {
      if (backLayer.name === name) {
        backLayer.cache = cache;
      }
    });
  }

  setNewCacheInActiveBackLayer(cache) {
    this.backLayerService.backLayers.active.cache = cache;
  }

  validate() {
    let extent = this.cacheMapManager.getCurrentArea();
    this.layerModel = this.backLayerService.backLayers.active;

    // Update layer model and force update.
    const cache = {
      active: true,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      extent,
      url: this.file.externalDataDirectory + 'tiles/' + this.layerModel.name + '/{z}/{x}/{y}.png'
    };

    this.setNewCacheInGoodLayerInBackLayerList(cache);
    this.setNewCacheInActiveBackLayer(cache)
    this.backLayerService.updateListInHardDisk();
    this.backLayer.syncBackLayer();

    // Run cache plugin task.
    extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

    CacheMapPlugin.updateCache([{
      name: this.layerModel.name,
      layerSource: null,
      typeSource: this.layerModel.source.type,
      zMin: this.minZoom,
      zMax: this.maxZoom,
      urlSource: this.layerModel.source.url,
      bbox: [[extent[1], extent[0]], [extent[3], extent[2]]]
    }]);

    setTimeout(() => { this.route.navigateByUrl('/main') }, 300);
  }

  async deleteCache() {
    const alert = await this.alertCtrl.create({
      header: 'Suppression de cache',
      message: 'Voulez vous supprimer le cache de cette couche de données ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: () => {
            CacheMapPlugin.clearOneCache({
                name: this.layerModel.name,
                layerSource: null,
                typeSource: this.layerModel.source.type,
                zMin: this.layerModel.cache.minZoom,
                zMax: this.layerModel.cache.maxZoom,
                urlSource: this.layerModel.source.url,
                bbox: this.layerModel.cache.extent
            });

            delete this.layerModel.cache;
            this.backLayerService.setActive(this.layerModel.name);
          }
        }
      ]
    });
    await alert.present;
  }

}
