import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { OLService } from '@ionic-lib/lib-map/ol.service';
import { NativeStorageService } from '@ionic-lib/lib-storage/nativestorage.service';

import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Stroke, Style, Fill} from 'ol/style';
import CircleStyle from 'ol/style/Circle';

@Injectable({
  providedIn: 'root'
})
export class ShapesLayersManagerService {

  private allLayersDatabaseName = 'shapeLayers';

  //Here are managed the shapes added as superficial layers.

  allLayers = [];

  geoJsonArrayForDatabase: {
    name: string,
    visibility: boolean,
    geojson
  }[] = [];

  constructor(
    private http: HttpClient,
    private olService: OLService,
    private nativeStorage: NativeStorageService
    ) { }

  async init() {
    this.allLayers = [];
    this.geoJsonArrayForDatabase = []; // Called everytime main.component.ts ngAfterViewInit is triggered.
    await this.getAllLayersFromDevice()
      .then((allGeojsons: any) => {
        if (allGeojsons.error && allGeojsons.error.code==2) {
          this.geoJsonArrayForDatabase = [];
        } else if (allGeojsons.error) {
          console.error(allGeojsons);
          this.geoJsonArrayForDatabase = [];
        } else {
          this.geoJsonArrayForDatabase = allGeojsons
        }
      })
      .catch(error => console.error(error));

      if (this.geoJsonArrayForDatabase && this.geoJsonArrayForDatabase.length > 0) {
        for (let geojsonObj of this.geoJsonArrayForDatabase) {
          const features = new GeoJSON().readFeatures(geojsonObj.geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          });
          this.addFeaturesToMap(geojsonObj.name, features);
        }

        if (this.geoJsonArrayForDatabase.length == this.allLayers.length) { // These two arrays should always have the same size.
          for (let i = 0; i < this.geoJsonArrayForDatabase.length; i++) {
            if (this.geoJsonArrayForDatabase[i].visibility===false) {
              this.allLayers[i].setVisible(false);
            }
          }
        }
      }
  }

  addFeaturesToMap(name: string, features) {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      name: name,
      source: vectorSource,
      style: this.styleFunction,
    });
    vectorSource.addFeatures(features);
    this.olService.addLayer(vectorLayer);

    this.allLayers.push(vectorLayer);
  }
  saveGeojson(sourceGeoJsonName: string, sourceGeoJson, visibility: boolean) {
    this.geoJsonArrayForDatabase.push({
      name: sourceGeoJsonName,
      visibility: visibility,
      geojson: sourceGeoJson,
    })
    this.saveAllLayersInDevice();
  }

  removeLayerFromMap(layer, index) {
    this.olService.removeLayer(layer);
    this.allLayers.splice(index, 1);
    this.geoJsonArrayForDatabase.splice(index, 1);
    this.saveAllLayersInDevice();
  }

  updateVisibility(visibility: boolean, index: number) {
    this.geoJsonArrayForDatabase[index].visibility = visibility;
    this.saveAllLayersInDevice();
  }

  getAllLayers() {
    return this.allLayers;
  }

  styleFunction(feature) {
    const image = new CircleStyle({
      radius: 5,
      fill: null,
      stroke: new Stroke({ color: '#0098A6', width: 1 }),
    });
  
    const styles = {
      'Point': new Style({
        image: image,
      }),
      'LineString': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
      }),
      'MultiLineString': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
      }),
      'MultiPoint': new Style({
        image: image,
      }),
      'MultiPolygon': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
        // fill: new Fill({
        //   color: 'rgba(255, 255, 0, 0.1)',
        // }),
      }),
      'Polygon': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
        // fill: new Fill({
        //   color: 'rgba(0, 0, 255, 0.1)',
        // }),
      }),
      'GeometryCollection': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
        // fill: new Fill({
        //   color: 'magenta',
        // }),
        image: new CircleStyle({
          radius: 10,
          fill: null,
          stroke: new Stroke({
            color: '#0098A6',
          }),
        }),
      }),
      'Circle': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(0, 152, 166 ,0.2)',
        }),
      }),
    };

    return styles[feature.getGeometry().getType()];
  };

  wfsRequest(url: string) {
    return new Promise((resolve, reject) => {
      this.http.get(url, {reportProgress: true, observe: 'events'}).subscribe((geoJsonEvent: any) => {
        if (geoJsonEvent.type === HttpEventType.DownloadProgress) {
          console.log('download progress: ', geoJsonEvent); // TODO : A small window somewhere on the screen showing the download progress.
        }
        if (geoJsonEvent.type === HttpEventType.Response) {
          resolve(geoJsonEvent.body);
        }
      }, error => {
        reject(error);
      });
    })
  }

  saveAllLayersInDevice() {
    this.nativeStorage.setItem(this.allLayersDatabaseName, this.geoJsonArrayForDatabase);
  }

  getAllLayersFromDevice() {
    return new Promise((resolve, reject) => {
      this.nativeStorage.getItem(this.allLayersDatabaseName)
      .then(allGeojsons => {
        resolve(allGeojsons);
      })
      .catch(error => reject(error));
    })
  }

}
