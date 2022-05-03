import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import GeoJSON from 'ol/format/GeoJSON';
import { ShapesLayersManagerService } from 'src/app/services/shapes-layers-manager.service';
import { File, FileEntry } from '@ionic-native/file/ngx';

import * as shapefile from 'node_modules/shapefile';
import { WebView } from '@ionic-native/ionic-webview/ngx';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

@Component({
    selector: 'app-add-shapes-layers',
    templateUrl: './add-shapes-layers.component.html',
    styleUrls: ['./add-shapes-layers.component.scss'],
})
export class AddShapesLayersComponent implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();

    layerTypes = ['WFS', 'shapefile', 'geojson'];
    selectedType = 'WFS';

    wfsInputs = {
        url: 'https://',
        layerName: null,
        version: '1.1.0',
    };

    shapefileInput = {
        path: null
    };

    geoJson = {
        path: null
    };

    constructor(
        private shapesLayersManagerService: ShapesLayersManagerService,
        private toastCtrl: ToastController,
        private fileChooser: FileChooser,
        private file: File,
        private filePath: FilePath,
        private webview: WebView,
    ) {
    }

    ngOnInit() {
    }

    wfsRequest() {
        const typeNameParameter = this.wfsInputs.version === '1.1.0' ? 'typeName=' : 'typeNames=';
        const url = this.wfsInputs.url + '?'
            + 'request=GetFeature'
            + '&service=WFS'
            + `&version=${this.wfsInputs.version}`
            + '&' + typeNameParameter + `${this.wfsInputs.layerName}`
            + '&outputformat=application/json';

        this.shapesLayersManagerService.wfsRequest(url)
            .then((geojson) => {
                this.shapesLayersManagerService.saveLayer(this.wfsInputs.layerName, 'WFS', url, true, null);
                this.geoJsonTreatment(this.wfsInputs.layerName, geojson, 'EPSG:4326');
            })
            .catch(async error => {
                const toast = await this.toastCtrl.create({
                    message: 'Erreur lors de la requête WFS.',
                    duration: 5000
                });
                toast.present();
                console.error('WFS request failed : ', error);
            });
    }

    importGeoJson() {
        this.fileChooser.open()
            .then(uri => {
                this.filePath.resolveNativePath(uri)
                    .then(filePath => {
                        const path = filePath.split('/');
                        this.file.readAsText(filePath.replace(path[path.length - 1], ''), path[path.length - 1])
                            .then(res => {
                                // condition checking that the file has a name and is not just .json, otherwise it would be null.
                                const fileName = path[path.length - 1].split('.')[0] !== '' ? path[path.length - 1].split('.')[0] : 'no name file';
                                this.shapesLayersManagerService.saveLayer(fileName, 'geojson', uri, true, null);
                                this.geoJsonTreatment(fileName, res, 'EPSG:4326');
                            })
                            .catch(async error => {
                                const toast = await this.toastCtrl.create({
                                    message: 'Erreur lors de la lecture du fichier.',
                                    duration: 4000
                                });
                                toast.present();
                                console.error(error);
                            });
                    })
                    .catch(async error => {
                        const toast = await this.toastCtrl.create({
                            message: 'Erreur dans le chemin d’accès au fichier, il faut sélectionner un chemin correct.',
                            duration: 4000
                        });
                        toast.present();
                        console.error(error);
                    });
            })
            .catch(async e => {
                const toast = await this.toastCtrl.create({
                    message: 'Erreur lors de l\'ouverture du fichier.',
                    duration: 4000
                });
                toast.present();
                console.error(e);
            });
    }

    importShapefile() {
        const featuresArray = [];
        this.fileChooser.open()
            .then(uri => {
                this.filePath.resolveNativePath(uri)
                    .then(async filePath => {

                        // const proj = await this.getProj(filePath);
                        // const codeProj = proj === null ? 'EPSG:4326' : filePath;
                        const proj = null;
                        const codeProj = 'EPSG:4326';

                        const onceDone = (featuresArray) => { // function called once all features have recursively been added to the array with shapefile.open(...).
                            const path = filePath.split('/');
                            const fileName = path[path.length - 1].split('.')[0] !== '' ? path[path.length - 1].split('.')[0] : 'no name file'; // condition checking that the file has a name and is not just .json, otherwise it would be null.
                            const geoJsonObject = {
                                type: 'FeatureCollection',
                                features: featuresArray
                            };
                            this.shapesLayersManagerService.saveLayer(fileName, 'shapefile', uri, true, proj);
                            this.geoJsonTreatment(fileName, geoJsonObject, codeProj);
                        };

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
                                            onceDone(featuresArray);
                                            return;
                                        }
                                        return source.read().then(log);
                                    });
                            })
                            .catch(async error => {
                                const toast = await this.toastCtrl.create({
                                    message: 'Erreur lors de la lecture du fichier. Assurez-vous d\'avoir sélectionné un fichier .shp avec ses composants (.shx, .dbf, .prj).',
                                    duration: 6000
                                });
                                toast.present();
                                console.error(error);
                            });
                    })
                    .catch(async error => {
                        const toast = await this.toastCtrl.create({
                            message: 'Erreur lors de la lecture du chemin du fichier.',
                            duration: 4000
                        });
                        toast.present();
                        console.error(error);
                    })
            })
            .catch(async e => {
                const toast = await this.toastCtrl.create({
                    message: 'Erreur lors de l\'ouverture du fichier.',
                    duration: 4000
                });
                toast.present();
                console.error(e);
            });
    }

    geoJsonTreatment(name: string, geoJson, codeEpsg: string) {
        const features = new GeoJSON().readFeatures(geoJson, {
            dataProjection: codeEpsg,
            featureProjection: 'EPSG:3857'
        });

        this.shapesLayersManagerService.addFeaturesToMap(name, features);
        // this.shapesLayersManagerService.saveGeojson(name, geoJson, true);
        this.goBack();
    }

    goBack() {
        this.slidePathChange.emit('shapeLayerManager');
    }

    getProj(shpPath): Promise<string | null> {
        return new Promise<string>((resolve, reject) => {
            let splited = shpPath.split('/');
            const fileName = splited[splited.length - 1].split('.')[0];
            if (fileName !== '') {
                //dir path
                splited.pop();
                let dirPath = splited.join('/');

                this.file.readAsText(dirPath, fileName + '.prj')
                    .then(projTxt => {
                        proj4.defs(shpPath, projTxt);
                        register(proj4);
                        resolve(projTxt);
                    })
                    .catch(async error => {
                        console.log('INFO: no projection file (.prj) next to file ' + shpPath);
                        resolve(null);
                    });
            } else {
                resolve(null);
            }
        })
    }
}
