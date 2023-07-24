import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { AlertController } from '@ionic/angular';
import { transformExtent } from 'ol/proj';
import View from 'ol/View';
import { BackLayerService } from 'src/app/services/back-layer.service';
import { MapService } from 'src/app/services/map.service';
import { ListBackLayer } from 'src/app/components/database-connection/models/database.model';
import { OLService } from '../../../../../../libs/geomatys-ionic-libraries-framework/demo/src/lib/lib-map/ol.service';
import { CacheMapManager } from 'src/app/services/cache.service';

@Component({
  selector: 'cache',
  templateUrl: './cache.component.html',
  styleUrls: ['./cache.component.scss'],
})
export class LeftSlideCacheComponent implements AfterViewInit, OnDestroy {
  id;
  selectedCorner;
  minZoom;
  maxZoom;
  tileCount;
  currentView: View;
  layerModel: ListBackLayer;
  lastZoom: number;
  knobValues: { lower: number, upper: number };

  constructor(private backLayerService: BackLayerService, private activeRoute: ActivatedRoute,
              private mapService: MapService, private cacheMapManager: CacheMapManager,
              private route: Router, private file: File,
              private alertCtrl: AlertController, private ol: OLService,
              private cdRef: ChangeDetectorRef) {
                this.ol.map = null;

                this.id = null;
                this.selectedCorner = null;
                this.minZoom = null;
                this.maxZoom = null;
                this.tileCount = 0;
                this.currentView = null;
                this.layerModel = null;
                this.lastZoom = 0;
                this.knobValues = null;

                this.knobValues = { lower: 7, upper: 16 }
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
                this.cacheMapManager.translateInteraction.on("translateend",(event) => this.onCenterChanged(event));
  }

  ngAfterViewInit() {
    this.ol.map = this.cacheMapManager.buildConfig();
    this.setDefaultArea(this.ol.map);
    this.ol.map.updateSize();
  }

  ngOnDestroy(): void {
    this.cacheMapManager.clearTargetLayer();
    this.currentView.un('change:center', this.onCenterChanged);
    this.cacheMapManager.translateInteraction.un("translateend", (event) => this.onCenterChanged(event));
    this.ol.map.setTarget();
    this.ol.map = null;
  }

  goBack() {
    this.route.navigateByUrl('/main').then();
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
        this.cacheMapManager.setCurrentArea(extent);
    }
    // Compute the number of tiles.
    this.updateTileCount();
  }

  getCurrentZoom() {
    const zoom = this.currentView.getZoom();
    if (typeof zoom !== 'undefined') {
        this.lastZoom = zoom;
    }
    return this.lastZoom;
  }

  onCenterChanged(event) {
      this.updateTileCount();
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
    this.backLayerService.syncBackLayer();

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

    setTimeout(() => { this.route.navigateByUrl('/main') }, 300); // Hack timeout for 300ms. I don't know why. Proper solution must be found.
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
            const cache = this.layerModel.cache;
            CacheMapPlugin.clearOneCache({
                name: this.layerModel.name,
                layerSource: null,
                typeSource: this.layerModel.source.type,
                zMin: cache.minZoom,
                zMax: cache.maxZoom,
                urlSource: this.layerModel.source.url,
                bbox: cache.extent
            });

            delete this.layerModel.cache;
            this.backLayerService.setActiveBackLayer(this.layerModel);
            setTimeout(() => { this.route.navigateByUrl('/main') }, 300); // Hack timeout for 300ms. I don't know why. Proper solution must be found.
          }
        }
      ]
    });
    await alert.present();
  }

}
