import { Component, OnInit } from '@angular/core';

import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import MultiPoint from 'ol/geom/MultiPoint';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import ScaleLine from 'ol/control/ScaleLine';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';
import { get } from 'ol/proj';
import { getWidth, getHeight } from 'ol/extent';
import { defaults as defaultsInteraction } from 'ol/interaction';
import { transformExtent } from 'ol/proj';

import { MapService } from 'src/app/map.service';
import { BackLayerService } from 'src/app/backlayer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLayer } from 'src/app/layers.service';

@Component({
  selector: 'cache',
  templateUrl: './cache.component.html',
  styleUrls: ['./cache.component.scss'],
})
export class LeftSlideCacheComponent implements OnInit {

  id = null;
  selectedCorner = null;
  minZoom = null;
  maxZoom = null;
  tileCount = 0;

  constructor(private backLayerService: BackLayerService, private activeRoute: ActivatedRoute,
              private mapService: MapService, private cacheMapManager: CacheMapManager,
              private route: Router, private backLayer: BackLayer) {
                this.id = this.activeRoute.snapshot.paramMap.get('id');
              }

  currentView = this.mapService.currentView;
  layerModel = this.backLayerService.getByName(this.id);
  lastZoom = this.currentView.getZoom();

  ngOnInit() {
    this.minZoom = typeof this.layerModel.cache === 'object' ? this.layerModel.cache.minZoom : 7;
    this.maxZoom = typeof this.layerModel.cache === 'object' ? this.layerModel.cache.maxZoom : 16;
  }

  updateTileCount() {
    // console.log('file, ', this.file.externalDataDirectory);
    this.tileCount = this.cacheMapManager.countTiles(this.minZoom, this.maxZoom);
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

  editCorner(corner) {
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
      setTimeout(this.updateTileCount);
    }
  }

  validate() { // TODO
    let extent = this.cacheMapManager.getCurrentArea();

    // Update layer model and force update.
    this.layerModel.cache = {
        active: true,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        extent,
        // url: cordova.file.externalDataDirectory + 'tiles/' + this.layerModel.name + '/{z}/{x}/{y}.png'
    };
    this.backLayer.syncBackLayer();

    // Run cache plugin task.
    extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

    // CacheMapPlugin.updateCache([{
    //     name: this.layerModel.name,
    //     layerSource: null,
    //     typeSource: this.layerModel.source.type,
    //     zMin: this.minZoom,
    //     zMax: this.maxZoom,
    //     urlSource: this.layerModel.source.url,
    //     bbox: [[extent[1], extent[0]], [extent[3], extent[2]]]
    // }]);

    this.route.navigateByUrl('/main');
  }

  deleteCache() { // TODO
    // $ionicPopup.confirm({
    //     title: 'Suppression de cache',
    //     template: 'Voulez vous supprimer le cache de cette couche de données ?'
    // }).then(function (confirmed) {
    //     if (confirmed) {
    //         CacheMapPlugin.clearOneCache({
    //             name: this.layerModel.name,
    //             layerSource: null,
    //             typeSource: this.layerModel.source.type,
    //             zMin: this.layerModel.cache.minZoom,
    //             zMax: this.layerModel.cache.maxZoom,
    //             urlSource: this.layerModel.source.url,
    //             bbox: this.layerModel.cache.extent
    //         });

    //         delete this.layerModel.cache;
    //         this.backLayerService.setActive(this.layerModel.name);
    //     }
    //     return confirmed;
    // });
  }


  // CacheMapManager.setTargetLayer(self.layerModel);

  // currentView.on('change:center', onCenterChanged);

  // currentView.on('change:resolution', onResolutionChanged);

  // $scope.$on('$destroy', function () {
  //     CacheMapManager.clearTargetLayer();
  //     currentView.un('change:center', onCenterChanged);
  //     currentView.un('change:resolution', onResolutionChanged);
  // });

}

export class CacheMapManager {

  targetLayer = new TileLayer({
    name: 'Target'
  });

  previousAreaLayer = new VectorLayer({
    name: 'Previous Area',
    source: new VectorSource(),
    style: [
      new Style({
          fill: new Fill({color: [255, 0, 0, 0.1]}),
          stroke: new Stroke({color: [255, 0, 0, 1], width: 2})
      }),
      new Style({
          image: new CircleStyle({
              radius: 5,
              fill: new Fill({color: [255, 0, 0, 1]})
          }),
          geometry: (feature) => {
              // return the coordinates of the first ring of the polygon
              const coordinates = feature.getGeometry().getCoordinates()[0];
              return new MultiPoint(coordinates);
          }
      })
    ]
  });

  currentAreaLayer = new VectorLayer({
    name: 'Current Area',
    source: new VectorSource(),
    style: [
        new Style({
            fill: new Fill({color: [0, 0, 255, 0.1]}),
            stroke: new Stroke({color: [0, 0, 255, 1], width: 2})
        }),
        new Style({
            image: new CircleStyle({
                radius: 5,
                fill: new Fill({color: [0, 0, 255, 1]})
            }),
            geometry: (feature) => {
                // return the coordinates of the first ring of the polygon
                const coordinates = feature.getGeometry().getCoordinates()[0];
                return new MultiPoint(coordinates);
            }
        })
    ]
  });

  constructor(private mapService: MapService) { }

  createFeatureInstance(extent) {
    return new Feature({geometry: new Polygon(extent)});
  }

  buildConfig() {
    return {
        view: this.mapService.currentView,
        layers: [this.targetLayer, this.previousAreaLayer, this.currentAreaLayer],
        controls: [
            new ScaleLine({
                minWidth: 100
            })
        ],
        interactions: defaultsInteraction.extent({
          altShiftDragRotate: false,
          shiftDragZoom: false
        })
    };
  }

  handleTypesSource(layerModel) {
    if (layerModel.source.type === 'OSM') {
      return new OSM(layerModel.source);
    } else if (layerModel.source.type === 'TileWMS') {
        return new TileWMS(layerModel.source);
    } else if (layerModel.source.type === 'XYZ') {
        return new XYZ(layerModel.source);
    } else {
        return new OSM({
            url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        });
    }
  }

  setTargetLayer(layerModel) {
    this.targetLayer.setSource(this.handleTypesSource(layerModel));

    if (typeof layerModel.cache === 'object') {
        this.previousAreaLayer.getSource().addFeature(this.createFeatureInstance(layerModel.cache.extent));
    }
  }

  clearTargetLayer() {
    this.targetLayer.setSource(null);
    this.previousAreaLayer.getSource().clear();
    this.currentAreaLayer.getSource().clear();
  }

  setCurrentArea(extent) {
    this.currentAreaLayer.getSource().clear();
    if (Array.isArray(extent)) {
        this.currentAreaLayer.getSource().addFeature(this.createFeatureInstance(extent));
    }
  }

  getCurrentArea() {
    const feature = this.currentAreaLayer.getSource().getFeatures()[0];
    if (feature instanceof Feature) {
        return feature.getGeometry().getExtent();
    }
    return null;
  }

  countTiles(minZoom, maxZoom) {

    let tileGrid = this.targetLayer.getSource().getTileGrid();

    const extent = this.getCurrentArea();
    let tileCount = 0;

    // In the case the tileGrid not exist use the default tileGrid
    if (!tileGrid) {
        const projExtent = get('EPSG:3857').getExtent();
        const startResolution = getWidth(projExtent) / 256;
        const resolutions = new Array(22);
        for (let i = 0, j = resolutions.length; i < j; ++i) {
          resolutions[i] = startResolution / Math.pow(2, i);
        }
        tileGrid = new TileGrid({
            origin: [0, 0],
            resolutions
        });
    }
    for (let i = minZoom; i <= maxZoom; i++) {
        const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, i);
        tileCount += (tileRange.getWidth() * tileRange.getHeight());
    }

    return tileCount;
  }

}
