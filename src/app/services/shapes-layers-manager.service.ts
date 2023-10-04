// @ts-nocheck

import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { OLService } from '@ionic-lib/lib-map/ol.service';
import { NativeStorageService } from '@ionic-lib/lib-storage/nativestorage.service';
import { FilePath } from '@ionic-native/file-path/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';

import GeoJSON from 'ol/format/GeoJSON';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import { Stroke, Style, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import * as shapefile from 'node_modules/shapefile';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

@Injectable({
  providedIn: 'root'
})
export class ShapesLayersManagerService {

  private static SHAPE_LAYERS_KEY = 'shapeLayers';

  //Here are managed the shapes added as superficial layers.

  allLayers = [];

  shapeLayers: {
    name: string,
    type: string,
    url: string,
    visibility: boolean,
    proj: string
  }[] = [];

  constructor(private http: HttpClient, private olService: OLService, private nativeStorage: NativeStorageService,
    private filePath: FilePath, private file: File, private webview: WebView) { }

  async init() {
    this.allLayers = [];
    this.shapeLayers = []; // Called everytime main.component.ts ngAfterViewInit is triggered.
    await this.getAllLayersFromDevice()
      .then(async (dataLayers: any) => {
        if (dataLayers.error) {
          if (dataLayers.error.code === undefined || dataLayers.error.code !== 2) {
            console.warn(dataLayers.error);
          }
          this.shapeLayers = [];
        } else {
          this.shapeLayers = dataLayers;
        }
      })
      .catch(error => console.error(error));

    if (this.shapeLayers && this.shapeLayers.length > 0) {
      const copy = this.shapeLayers.map(x => Object.assign({}, x));
      for (let data of copy) {
        let geojson = await this.getGeojson(data);
        const projCode = this.getProjCode(data);
        try {
          const features = new GeoJSON().readFeatures(geojson, {
            dataProjection: projCode,
            featureProjection: 'EPSG:3857'
          });
          this.addFeaturesToMap(data.name, features);
        } catch (err) {
          console.error('Lecture du geojson ' + geojson + ' impossible. Suppression de la référence dans le stockage.');
          console.error(err);
          const i: number = copy.indexOf(data);
          this.shapeLayers.splice(i, 1);
          this.saveAllLayersInDevice();
        }
      }

      if (this.shapeLayers.length == this.allLayers.length) { // These two arrays should always have the same size.
        for (let i = 0; i < this.shapeLayers.length; i++) {
          if (this.shapeLayers[i].visibility === false) {
            this.allLayers[i].setVisible(false);
          }
        }
      }
    }
  }

  getProjCode(data) {
    let proj = data.proj;

    if (proj === null) return 'EPSG:4326';
    proj4.defs(data.url, proj);
    register(proj4);
    return data.url
  }

  addFeaturesToMap(name: string, features) {
    //prefer VectorImageLayer instead of VectorLayer for reason of performance with regard to the data size imported
    const layer = new VectorImageLayer({
      source: new VectorSource({
        features: features
      }),
      style: this.styleFunction
    });
    this.olService.addLayer(layer);
    this.allLayers.push(layer);
  }

  saveLayer(name: string, type: string, url: string, visibility: boolean, proj: string) {
    this.shapeLayers.push({
      name: name,
      type: type,
      url: url,
      visibility: visibility,
      proj: proj
    });
    this.saveAllLayersInDevice();
  }

  removeLayerFromMap(layer, index) {
    this.olService.removeLayer(layer);
    this.allLayers.splice(index, 1);
    this.shapeLayers.splice(index, 1);
    this.saveAllLayersInDevice();
  }

  updateVisibility(visibility: boolean, index: number) {
    this.shapeLayers[index].visibility = visibility;
    this.saveAllLayersInDevice();
  }

  getAllLayers() {
    return this.allLayers;
  }

  styleFunction(feature : Feature<Point>) {
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
      }),
      'Polygon': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
      }),
      'GeometryCollection': new Style({
        stroke: new Stroke({
          color: '#0098A6',
          width: 1,
        }),
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
      this.http.get(url, { reportProgress: true, observe: 'events' }).subscribe((geoJsonEvent: any) => {
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
    this.nativeStorage.setItem(ShapesLayersManagerService.SHAPE_LAYERS_KEY, this.shapeLayers);
  }

  getAllLayersFromDevice() {
    return new Promise((resolve, reject) => {
      this.nativeStorage.getItem(ShapesLayersManagerService.SHAPE_LAYERS_KEY)
        .then(dataLayers => {
          resolve(dataLayers);
        })
        .catch(error => reject(error));
    });
  }

  getGeojson(data) {
    return new Promise(resolve => {
      if (data.type === 'WFS') {
        this.wfsRequest(data.url)
          .then(geojson => resolve(geojson));
      } else if (data.type === 'shapefile') {
        this.getGeojsonFromShapefile(data.url)
          .then(geojson => resolve(geojson));
      } else if (data.type === 'geojson') {
        this.getGeojsonFromGeojson(data.url)
          .then(geojson => resolve(geojson));
      }
    })
  }

  getGeojsonFromGeojson(uri) {
    return new Promise((resolve, reject) => {
      this.filePath.resolveNativePath(uri)
      .then(filePath => {
        const path = filePath.split('/');
        this.file.readAsText(filePath.replace(path[path.length - 1], ''), path[path.length - 1])
          .then(res => resolve(res))
          .catch(error => {
            console.error(error);
            reject('Erreur lors de la lecture du fichier.');
          });
      })
      .catch(error => {
        console.error(error);
        reject('Erreur dans le chemin d’accès au fichier, il faut sélectionner un chemin correct.');
      });
    })
  }

  getGeojsonFromShapefile(uri) {
    const featuresArray = [];

    return new Promise((resolve, reject) => {
      this.filePath.resolveNativePath(uri)
        .then(filePath => {
          const newPathTest = this.webview.convertFileSrc(filePath); // shapefile(to json) api does not accept file:///... path.
          shapefile.open(newPathTest)
            .then(source => {
              source.read()
                .then(function log(result) {
                  if (result.value) {
                    featuresArray.push(result.value);
                  }
                  if (result.done) {
                    // Code put in a function as the scope for 'this' is lost. There must be cleaner ways to do it.
                    resolve({
                      type: 'FeatureCollection',
                      features: featuresArray
                    });
                    return;
                  }
                  return source.read().then(log);
                });
            })
            .catch(async error => {
              console.error(error);
              reject('Erreur lors de la lecture du fichier. Assurez-vous d\'avoir sélectionné un fichier .shp avec ses composants (.shx, .dbf, .prj).');
            });
        })
        .catch(async error => {
          console.error(error);
          reject('Erreur lors de la lecture du chemin du fichier.');
        })
    })
  }
}
