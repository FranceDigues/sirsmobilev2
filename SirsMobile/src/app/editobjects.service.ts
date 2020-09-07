import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { StorageService } from '@lib-storage/storage.service';
import { DatabaseService } from './database.service';
import { EditionModeService } from './editionmode.service';
import { GeolocService } from './geoloc.service';
import { GlobalConfigService } from './globalconfig.service';
import { AppLayer } from './layers.service';
import { ObjectDocService } from './objectdoc.service';
import { SirsDocService } from './sirsdoc.service';
import { ObjectEditPosByBorneController } from './sliders/right/createobjects/editobjects/editobjects.component';
import { UuidUtils as uuid } from './uuid-utils';
import WKT from 'ol/format/WKT';
import { transform } from 'ol/proj';
import { getDistance } from 'ol/sphere';

@Injectable({
    providedIn: 'root'
})
export class EditObjectService {

    wktFormat = new WKT();
    type = '';
    isNew = true;
    tab = 'fields';
    view = 'form';
    designation = '';
    objectDoc = null;
    isLinear = false;
    objDependanceType = null;
    dependances = [];
    linearPosEditionHandler = {
        startPoint: false,
        endPoint: false
    };
    config = null;
    troncons = [];
    allTroncons = [];
    geoloc = undefined;
    refs = null;
    dateWrapper = null;
    objectType = null;
    dataProjection = this.sirsDoc.get().epsgCode;
    startPosBorneLabel = null;
    endPosBorneLabel = null;
    isClosed;

    constructor(private activeRoute: ActivatedRoute, private objectDocService: ObjectDocService,
        private databaseService: DatabaseService, private loadingCtrl: LoadingController,
        private globalConfigService: GlobalConfigService,
        private sirsDoc: SirsDocService, private editionModeService: EditionModeService,
        private route: Router, private appLayer: AppLayer, private toastCtrl: ToastController,
        private geolocService: GeolocService, private alertCtrl: AlertController,
        private editPosByBornCtrl: ObjectEditPosByBorneController, private storageService: StorageService) { }

    init(type, isNew) {
        this.resetValues();
        this.type = type;
        this.isNew = isNew;
        this.loadingCtrl.create({ message: 'Chargement' })
        .then(
            (loading) => {
                loading.present();
            this.objectDocService.getObjectDoc(this.activeRoute.snapshot.params)
            .then(
                (objectDoc) => {
                console.log('la base : ', objectDoc);
                // Hack for borne fin data without borneFinId
                if (typeof (objectDoc.borne_fin_aval) !== 'undefined' && typeof (objectDoc.borne_fin_distance) !== 'undefined' && !objectDoc.borneFinId) {
                    objectDoc.borneFinId = objectDoc.borneDebutId;
                    objectDoc.borne_fin_aval = objectDoc.borne_debut_aval;
                    objectDoc.borne_fin_distance = objectDoc.borne_debut_distance;
                }
                this.objectDoc = objectDoc;
                console.log('tmp :', this.objectDoc);
                this.objectType = objectDoc['@class'].substring(objectDoc['@class'].lastIndexOf('.') + 1);
                this.isClosed = (!!objectDoc.positionFin || !!objectDoc.geometry || !!objectDoc.borneFinId);
                this.objectType = this.objectDoc;

                // Hack for borne fin data without borneFinId
                this.editionModeService.getReferenceTypes()
                .then(
                    (refs) => {
                        let res = { };

                        for (let ref of refs) { // * need to do this bcs Promis.all accepts only array on parameter and not object
                            res[ref[0]] = ref[1];
                        }
                        this.refs = res;
                        console.log('refss: ', this.refs);
                        this.initTronconList();
                        this.checkDependance(loading);
                    }
                )
            });
        });
        this.config = this.globalConfigService.context;
        if (this.isNew) {
            this.isLinear = false;
        } else {
            if (this.objectDoc.positionDebut && this.objectDoc.positionFin && this.objectDoc.positionDebut === this.objectDoc.positionFin) {
                this.isLinear = false;
            } else if (this.objectDoc.borneDebutId && this.objectDoc.borneFinId
            && (this.objectDoc.borneDebutId === this.objectDoc.borneFinId
            || this.objectDoc.borne_debut_aval === this.objectDoc.borne_fin_aval
            || this.objectDoc.borne_debut_distance === this.objectDoc.borne_fin_distance)) {
                this.isLinear = false;
            } else {
                this.isLinear = true;
            }
        }
    }

    resetValues() {
        this.type = '';
        this.isNew = true;
        this.tab = 'fields';
        this.view = 'form';
        this.designation = '';
        this.objectDoc = null;
        this.isLinear = false;
        this.objDependanceType = null;
        this.dependances = [];
        this.linearPosEditionHandler = {
            startPoint: false,
            endPoint: false
        };
        this.config = null;
        this.troncons = [];
        this.allTroncons = [];
        this.geoloc = undefined;
        this.refs = null;
        this.dateWrapper = null;
        this.objectType = null;
        this.dataProjection = this.sirsDoc.get().epsgCode;
        this.startPosBorneLabel = null;
        this.endPosBorneLabel = null;
        this.isClosed;
    }

    showText(type) {
        return this.config === type;
    }

    formatDate() {
        const date = new Date(this.dateWrapper);
        this.objectDoc.date_fin = date.toISOString().split('T')[0];
    }

    watchDocPositionDebut() { // ! call this instead changing value alone
        const newValue = this.objectDoc.positionDebut;
        if (typeof newValue !== 'undefined') {
          this.troncons = this.calculateDistanceObjectTroncon(
            newValue,
            this.allTroncons
          );
        } else {
          this.troncons = this.allTroncons;
        }
    }

      watchDocPositionFin() { // ! call this instead changing value alone
        const newValue = this.objectDoc.positionFin;
        if (typeof newValue !== 'undefined') {
          this.troncons = this.calculateDistanceObjectTroncon(
            newValue,
            this.allTroncons
          );
        } else {
          this.troncons = this.allTroncons;
        }
    }

    calculateDistanceObjectTroncon(point, list) {
        let nearTronconList = [];
        // geomatryPosition is instance of ol.geom.Point
        let geomatryPosition = new WKT().readGeometry(point, {
            dataProjection: this.sirsDoc.get().epsgCode,
            featureProjection: 'EPSG:3857'
        });

        let positionCoord = geomatryPosition.getCoordinates();
        let geom = null;
        let geomTronc = null;
        // Get of the LineStrings from the list of Troncons
        list.forEach((elt)=> {
            try {
                geom = new WKT().readGeometry(elt.geometry, {
                    dataProjection: this.sirsDoc.get().epsgCode,
                    featureProjection: 'EPSG:3857'
                });
            } catch (e) {
                console.log(e);
            }
            geomTronc = geom.getClosestPoint(positionCoord);
            // Calculate the distance between two point

            // The distance
            let dist = getDistance(transform(positionCoord, 'EPSG:3857', 'EPSG:4326'),
                transform(geomTronc, 'EPSG:3857', 'EPSG:4326'), 6378137) / 1000;
            if (dist <= 1) {
                nearTronconList.push(elt);
            }
        });
        // The list of the nearest Troncons
        return nearTronconList;
    }

    setupRef(field, defaultRef, isMultiple?) {
        if (typeof this.objectDoc[field] !== 'undefined') {
            return;
        }
        if (typeof defaultRef === 'object') {
            this.objectDoc[field] = isMultiple ? [defaultRef.id] : defaultRef.id;
        } else {
            this.objectDoc[field] = isMultiple ? [] : undefined;
        }
    }

    createMeasure() {
        var defaultRef = this.refs.RefReferenceHauteur[0];
        return {
            '_id': uuid.generateUuid(),
            '@class': 'fr.sirs.core.model.MesureMonteeEaux',
            'date': new Date().toISOString(),
            'referenceHauteurId': defaultRef ? defaultRef.id : undefined,
            'hauteur': 0
        };
    }

    isDependance() {
        return this.objectType['@class'].toLowerCase().indexOf('dependance') > -1;
    }

    initTronconList() {
        this.storageService.getItem('AppTronconsFavorities')
        .then(
          (value) => {
            this.troncons = value;
            this.allTroncons = value;
            console.log('tronconnns', value);
          }
        );
    }

    private checkDependance(loading: HTMLIonLoadingElement) {
        if (this.isDependance()) {
          delete this.objectType.linearId;

          if (!this.objectType.geometry) {
              this.objDependanceType = 'point';
          } else {
              if (this.objectType.geometry.toUpperCase().indexOf('POLYGON') > -1 || this.objectType.geometry.toUpperCase().indexOf('MULTIPOLYGON') > -1) {
                  this.objDependanceType = 'polygon';
              } else if (this.objectType.geometry.toUpperCase().indexOf('POINT') > -1 || this.objectType.geometry.toUpperCase().indexOf('MULTIPOINT') > -1) {
                  this.objDependanceType = 'point';
              } else {
                  this.objDependanceType = 'line';
              }
          }

          if (this.objectType['@class'] === 'fr.sirs.core.model.DesordreDependance') {
              this.objectType.dependanceId = null;
              let promises = [];
              promises.push(this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                      startkey: ['fr.sirs.core.model.CheminAccesDependance'],
                      endkey: ['fr.sirs.core.model.CheminAccesDependance', {}],
                      include_docs: true
                  }),
                  this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                      startkey: ['fr.sirs.core.model.OuvrageVoirieDependance'],
                      endkey: ['fr.sirs.core.model.OuvrageVoirieDependance', {}],
                      include_docs: true
                  }),
                  this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                      startkey: ['fr.sirs.core.model.AutreDependance'],
                      endkey: ['fr.sirs.core.model.AutreDependance', {}],
                      include_docs: true
                  }),
                  this.databaseService.getLocalDB().query('Element/byClassAndLinear', {
                      startkey: ['fr.sirs.core.model.AireStockageDependance'],
                      endkey: ['fr.sirs.core.model.AireStockageDependance', {}],
                      include_docs: true
                  })
              );

              Promise.all(promises)
              .then((results) => {
                      setTimeout(() => {
                          this.dependances = [];
                          results.map((item) => {
                              item.rows.map((elt) => {
                                  this.dependances.push(elt);
                              })
                          });
                          loading.dismiss();
                      }, 100);
              }).catch((err) => {
                  console.log(err);
                  loading.dismiss();
              });
          } else {
            loading.dismiss();
          }
        } else {
          loading.dismiss();
        }
    }

    save() {
        if (!this.isDependance() && !this.objectType.linearId) {
          this.toastCtrl.create({
            message: 'Veuillez choisir un tronçon de rattachement pour cet objet',
            duration: 2000
          }).then((toast) => {
            toast.present();
          });
          return;
        }

        if ((!this.objectDoc.positionDebut && !this.objectDoc.borneDebutId) || (this.isDependance() && !this.objectDoc.geometry)) {
          this.toastCtrl.create({
            message: 'Veuillez choisir une position pour cet objet, avant de continuer',
            duration: 2000
          }).then((toast) => {
            toast.present();
          });
          return;
        }

        //@hb Add the source of the Desordre
        if (this.objectDoc['@class'] === "fr.sirs.core.model.Desordre") {
            this.objectDoc["sourceId"] = "RefSource:4";
        }

        this.objectDoc.valid = false;

        this.objectDoc.dateMaj = new Date().toISOString().split('T')[0];

        this.objectDoc.editMode = true;

        delete this.objectDoc.prDebut;

        delete this.objectDoc.prFin;

        if (this.objectDoc.borneDebutId) {
            delete this.objectDoc.positionDebut;
            this.watchDocPositionDebut();
            delete this.objectDoc.positionFin;
            delete this.objectDoc.geometry;
        }

        this.editionModeService.saveObject(this.objectDoc).then(
          () => {
            this.appLayer.syncAllAppLayer();
            this.route.navigateByUrl('/main');
        });
    }

    handlePos(pos) {
        delete this.objectDoc.systemeRepId;
        delete this.objectDoc.borne_debut_aval;
        delete this.objectDoc.borne_debut_distance;
        delete this.objectDoc.borneDebutId;
        delete this.objectDoc.borne_fin_aval;
        delete this.objectDoc.borne_fin_distance;
        delete this.objectDoc.borneFinId;
        delete this.objectDoc.borneDebutLibelle;
        delete this.objectDoc.borneFinLibelle;
        delete this.objectDoc.approximatePositionDebut;
        delete this.objectDoc.approximatePositionFin;

        this.objectDoc.editedGeoCoordinate = true;

        var coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);
        // Point case
        if (!this.isLinear) {
            this.objectDoc.positionDebut = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
            this.watchDocPositionDebut();
            this.objectDoc.positionFin = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
        } else {
            // Linear case
            if (this.linearPosEditionHandler.startPoint) {
                this.objectDoc.positionDebut = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
                this.watchDocPositionDebut();
                this.linearPosEditionHandler.startPoint = false;
            }

            if (this.linearPosEditionHandler.endPoint) {
                this.objectDoc.positionFin = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
                this.linearPosEditionHandler.endPoint = false;
                if (!this.objectDoc.positionDebut && this.objectDoc.positionFin) {
                    this.objectDoc.positionDebut = this.objectDoc.positionFin;
                    this.watchDocPositionDebut();
                }
            }
        }

    }

    handlePosDependance(pos) {
        delete this.objectDoc.systemeRepId;
        delete this.objectDoc.borne_debut_aval;
        delete this.objectDoc.borne_debut_distance;
        delete this.objectDoc.borneDebutId;
        delete this.objectDoc.borne_fin_aval;
        delete this.objectDoc.borne_fin_distance;
        delete this.objectDoc.borneFinId;
        delete this.objectDoc.borneDebutLibelle;
        delete this.objectDoc.borneFinLibelle;
        delete this.objectDoc.approximatePositionDebut;
        delete this.objectDoc.approximatePositionFin;
        delete this.objectDoc.positionDebut;
        this.watchDocPositionDebut();
        delete this.objectDoc.positionFin;

        var coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);
        // Point case
        if (this.objDependanceType === 'point') {
            this.objectDoc.geometry = 'POINT(' + coordinate[0] + ' ' + coordinate[1] + ')';
        } else {
            // Linear case
            if (this.objectDoc.geometry && this.objectDoc.geometry.toUpperCase().indexOf('LINESTRING') > -1) {
                var geometry = this.wktFormat.readGeometry(this.objectDoc.geometry);

                geometry.setCoordinates([coordinate, geometry.getLastCoordinate()]);

                this.objectDoc.geometry = this.wktFormat.writeGeometry(geometry);
            } else {
                this.objectDoc.geometry = 'LINESTRING(' + coordinate[0] + ' ' + coordinate[1] + ')';
            }
        }
    }

    handlePosDependanceEnd(pos) {
        delete this.objectDoc.systemeRepId;
        delete this.objectDoc.borne_debut_aval;
        delete this.objectDoc.borne_debut_distance;
        delete this.objectDoc.borneDebutId;
        delete this.objectDoc.borne_fin_aval;
        delete this.objectDoc.borne_fin_distance;
        delete this.objectDoc.borneFinId;
        delete this.objectDoc.borneDebutLibelle;
        delete this.objectDoc.borneFinLibelle;
        delete this.objectDoc.approximatePositionDebut;
        delete this.objectDoc.approximatePositionFin;
        delete this.objectDoc.positionDebut;
        this.watchDocPositionDebut();
        delete this.objectDoc.positionFin;

        var coordinate = transform([pos.longitude, pos.latitude], 'EPSG:4326', this.dataProjection);

        var geometry = this.wktFormat.readGeometry(this.objectDoc.geometry);

        geometry.setCoordinates([geometry.getFirstCoordinate(), coordinate]);

        this.objectDoc.geometry = this.wktFormat.writeGeometry(geometry);
    }

    handlePosByBorne(data) {
        delete this.objectDoc.positionDebut;
        this.watchDocPositionDebut();
        delete this.objectDoc.positionFin;
        delete this.objectDoc.geometry;
        delete this.objectDoc.longitudeMin;
        delete this.objectDoc.longitudeMax;
        delete this.objectDoc.latitudeMin;
        delete this.objectDoc.latitudeMax;
        delete this.objectDoc.geometryMode;
        this.objectDoc.editedGeoCoordinate = false;
        this.objectDoc.foreignParentId = this.objectType.linearId;

        // Point case
        if (!this.isLinear) {
            this.objectDoc.systemeRepId = data.systemeRepId;
            this.objectDoc.borne_debut_aval = data.borne_aval === 'true';
            this.objectDoc.borne_debut_distance = data.borne_distance;
            this.objectDoc.borneDebutId = data.borneId;
            this.objectDoc.borne_fin_aval = data.borne_aval === 'true';
            this.objectDoc.borne_fin_distance = data.borne_distance;
            this.objectDoc.borneFinId = data.borneId;
            this.objectDoc.borneDebutLibelle = data.borneLibelle;
            this.objectDoc.borneFinLibelle = data.borneLibelle;
            // Calculate the approximate position
            this.objectDoc.approximatePositionDebut = data.approximatePosition;
            this.objectDoc.approximatePositionFin = data.approximatePosition;
        } else {
            if (this.linearPosEditionHandler.startPoint || this.isNew) {
                this.objectDoc.systemeRepId = data.systemeRepId;
                this.objectDoc.borne_debut_aval = data.borne_aval === 'true';
                this.objectDoc.borne_debut_distance = data.borne_distance;
                this.objectDoc.borneDebutId = data.borneId;
                this.linearPosEditionHandler.startPoint = false;
                this.objectDoc.borneDebutLibelle = data.borneLibelle;
                // Calculate the approximate position
                this.objectDoc.approximatePositionDebut = data.approximatePosition;
            }
            if (this.linearPosEditionHandler.endPoint) {
                this.objectDoc.borne_fin_aval = data.borne_aval === 'true';
                this.objectDoc.borne_fin_distance = data.borne_distance;
                this.objectDoc.borneFinId = data.borneId;
                this.linearPosEditionHandler.endPoint = false;
                this.objectDoc.borneFinLibelle = data.borneLibelle;
                // Calculate the approximate position
                this.objectDoc.approximatePositionFin = data.approximatePosition;
            }

        }
    }

    changeObjectType() { // ! take care -> check if it's correct
        console.log('isLinear', this.isLinear);
        if (this.objDependanceType === 'line') {
          delete this.objectDoc.positionFin;
          delete this.objectDoc.approximatePositionFin;
        } else if (this.objDependanceType === 'point') {
          this.objectDoc.positionFin = this.objectDoc.positionDebut;
          this.objectDoc.approximatePositionFin = this.objectDoc.approximatePositionDebut;
        } else {
          delete this.objectDoc.positionFin;
          delete this.objectDoc.positionDebut;
          this.watchDocPositionDebut();
          delete this.objectDoc.approximatePositionFin;
          delete this.objectDoc.approximatePositionDebut;
        }
        delete this.objectDoc.geometry;
    }

    changeObjectTypeDependance() { // ! same check here
        if (this.objDependanceType === 'line') {
            delete this.objectDoc.positionFin;
            delete this.objectDoc.approximatePositionFin;
        } else if (this.objDependanceType === 'point') {
            this.objectDoc.positionFin = this.objectDoc.positionDebut;
            this.objectDoc.approximatePositionFin = this.objectDoc.approximatePositionDebut;
        } else {
            delete this.objectDoc.positionFin;
            delete this.objectDoc.positionDebut;
            this.watchDocPositionDebut();
            delete this.objectDoc.approximatePositionFin;
            delete this.objectDoc.approximatePositionDebut;
        }
        delete this.objectDoc.geometry;
    }

    getStartPos() {
        return this.objectDoc.positionDebut ? this.parsePos(this.objectDoc.positionDebut) : undefined;
    }

    getEndPos() {
        return this.objectDoc.positionFin ? this.parsePos(this.objectDoc.positionFin) : undefined;
    }

    getStartPosBorne() {
        if (!this.startPosBorneLabel) {
          this.databaseService.getLocalDB().query('byId', {
              key: this.objectDoc.borneDebutId
          }).then((results) => {
              let libelle = results.rows && results.rows.length ? results.rows[0].value.libelle : '';

              this.startPosBorneLabel = this.objectDoc.borneDebutId ? 'à ' + this.objectDoc.borne_debut_distance + ' m de la borne : ' +
                  libelle + ' en ' + (this.objectDoc.borne_debut_aval ? 'amont' : 'aval') : 'à definir';

              this.watchDocPositionDebut();

          });
        } else {
            return this.startPosBorneLabel;
        }
    }

    getEndPosBorne() {
        if (!this.endPosBorneLabel) {
          this.databaseService.getLocalDB().query('byId', {
              key: this.objectDoc.borneFinId
          }).then((results) => {
              let libelle = results.rows && results.rows.length ? results.rows[0].value.libelle : '';

              this.endPosBorneLabel = this.objectDoc.borneFinId ? 'à ' + this.objectDoc.borne_fin_distance + ' m de la borne : ' +
                  libelle + ' en ' + (this.objectDoc.borne_fin_aval ? 'amont' : 'aval') : 'à definir';

              this.watchDocPositionFin(); // ? not sure

          });
        } else {
            return this.endPosBorneLabel;
        }
    }

    getStartPosDependance() {
        return this.objectDoc.geometry ? this.parsePos(this.objectDoc.geometry) : undefined;
    }

    getEndPosDependance() {
        return this.objectDoc.geometry ? this.parsePosEnd(this.objectDoc.geometry) : undefined;
    }

    parsePos(position) {
        let geometry = this.wktFormat.readGeometry(position);
        return transform(geometry.getFirstCoordinate(), this.dataProjection, 'EPSG:4326');
    }

    parsePosEnd(position) {
        let geometry = this.wktFormat.readGeometry(position);
        return transform(geometry.getLastCoordinate(), this.dataProjection, 'EPSG:4326');
    }

        // * Location

    locateMe() {
        this.geolocService.getCurrentLocation()
        .then(
          (position) => {
            if (this.isDependance()) {
              this.handlePosDependance(position);
            } else {
              this.handlePos(position);
            }
          }
        );
    }

    locateMeEnd() {
        this.geolocService.getCurrentLocation()
        .then(
          (position) => {
            this.handlePosDependanceEnd(position);
          }
        );
    }

    activatedGPSPositionButton() {
        return this.objectType;
    }

    activatedPositionButton() {
        return this.objectType && (this.objectType.linearId || this.isDependance());
    }

    handleDrawPolygon(geometry) {
        this.objectDoc.geometry = geometry;
    }

    selectPosBySR() { // TODO
        // TODO give all variables from here to borneService (prbly ?)
        // BorneService.context = self;

        // TODO show modal
        // this.positionBySRModal.show();

        // Create borne position
        if (!this.objectDoc.systemeRepId) {
          const data = {
            systemeRepId: '',
            borne_aval: '',
            borne_distance: 0,
            borneId: '',
            borneLibelle: ''
          };
          this.editPosByBornCtrl.borneModalData(data);
            // $rootScope.$broadcast("borneModalData", {
            //     systemeRepId: '',
            //     borne_aval: '',
            //     borne_distance: 0,
            //     borneId: '',
            //     borneLibelle: ''
            // });
        }

        // Edit Debut
        if (this.objectDoc.systemeRepId && !this.linearPosEditionHandler.endPoint) {
          const data = {
            systemeRepId: this.objectDoc.systemeRepId,
            borne_aval: this.objectDoc.borne_debut_aval ? 'true' : 'false',
            borne_distance: this.objectDoc.borne_debut_distance,
            borneId: this.objectDoc.borneDebutId,
            borneLibelle: this.objectDoc.borneDebutLibelle || ''
          };
          this.editPosByBornCtrl.borneModalData(data);
          // $rootScope.$broadcast("borneModalData", {
          //       systemeRepId: this.objectDoc.systemeRepId,
          //       borne_aval: this.objectDoc.borne_debut_aval ? 'true' : 'false',
          //       borne_distance: this.objectDoc.borne_debut_distance,
          //       borneId: this.objectDoc.borneDebutId,
          //       borneLibelle: this.objectDoc.borneDebutLibelle || ''
          //   });
        }
        // Edit fin
        if (this.objectDoc.systemeRepId && this.linearPosEditionHandler.endPoint) {
          const data = {
            systemeRepId: this.objectDoc.systemeRepId,
            borne_aval: this.objectDoc.borne_fin_aval ? 'true' : 'false',
            borne_distance: this.objectDoc.borne_fin_distance,
            borneId: this.objectDoc.borneFinId,
            borneLibelle: this.objectDoc.borneFinLibelle || ''
          };
          this.editPosByBornCtrl.borneModalData(data);
          // $rootScope.$broadcast("borneModalData", {
          //       systemeRepId: this.objectDoc.systemeRepId,
          //       borne_aval: this.objectDoc.borne_fin_aval ? 'true' : 'false',
          //       borne_distance: this.objectDoc.borne_fin_distance,
          //       borneId: this.objectDoc.borneFinId,
          //       borneLibelle: this.objectDoc.borneFinLibelle || ''
          //   });
        }
    }

    compareRef(obj1, obj2) {
        let a = null;
        let b = null;
        let comparison = 0;
        if (this.showText('fullName')) {
            a = obj1.libelle;
            b = obj2.libelle;
        } else {
            a = obj1.abrege ? obj1.abrege : obj1.designation;
            b = obj2.abrege ? obj2.abrege : obj2.designation;
        }

        if (a > b) {
            comparison = 1;
        } else if (a < b) {
            comparison = -1;
        }

        return comparison;
    }
}
