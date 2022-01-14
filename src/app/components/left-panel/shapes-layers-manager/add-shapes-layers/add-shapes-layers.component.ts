import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {FileChooser} from '@ionic-native/file-chooser/ngx';
import {FilePath} from '@ionic-native/file-path/ngx';

import GeoJSON from 'ol/format/GeoJSON';
import {ShapesLayersManagerService} from 'src/app/services/shapes-layers-manager.service';
import {File, FileEntry} from '@ionic-native/file/ngx';

import * as shapefile from 'node_modules/shapefile';
import {WebView} from '@ionic-native/ionic-webview/ngx';

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
                this.geoJsonTreatment(this.wfsInputs.layerName, geojson);
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
                                this.geoJsonTreatment(fileName, res);
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
                    .then(filePath => {

                        const onceDone = (featuresArray) => { // function called once all features have recursively been added to the array with shapefile.open(...).
                            const path = filePath.split('/');
                            const fileName = path[path.length - 1].split('.')[0] !== '' ? path[path.length - 1].split('.')[0] : 'no name file'; // condition checking that the file has a name and is not just .json, otherwise it would be null.
                            const geoJsonObject = {
                                type: 'FeatureCollection',
                                features: featuresArray
                            };
                            this.geoJsonTreatment(fileName, geoJsonObject);
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
                                    message: 'Erreur lors de la lecture du fichier. Assurez-vous d\'avoir concervé les .shp et .dbf ensemble.',
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

    geoJsonTreatment(name: string, geoJson) {
        const features = new GeoJSON().readFeatures(geoJson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });

        this.shapesLayersManagerService.addFeaturesToMap(name, features);
        this.shapesLayersManagerService.saveGeojson(name, geoJson, true);
        this.goBack();
    }

    goBack() {
        this.slidePathChange.emit('shapeLayerManager');
    }

}
