import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { Router } from '@angular/router';
import { EditionModeService } from './edition-mode.service';
import { MapManagerService } from './map-manager.service';
import { AlertController } from '@ionic/angular';
import { FormsTemplateService } from './formstemplate.service';
import { EditObjectService } from './edit-object.service';
import { PluginUtils } from '../utils/plugin-utils';

@Injectable({
    providedIn: 'root'
})
export class ObjectDetails {

    // Paths
    photoDir;
    notesDir;
    docDic;

    // Selections
    selectedFeatures: Array<any>;
    selectedObject;
    selectedObservation;

    abstract;
    detailsType: 'objectDetails' | 'observationDetails';

    // Prestations
    prestationMap: Object;
    tempPrestation;
    allPrestationList: Array<any>;
    prestationList: Array<any>;

    // Desordres
    desordreMap: Object;
    tempDesordre;
    allDesordreList: Array<any>;
    desordreList: Array<any>;

    // isDependance
    isDependance: boolean;


    constructor(private localDB: LocalDatabase, private route: Router,
        private editionService: EditionModeService, private mapManagerService: MapManagerService,
        private alertCtrl: AlertController, private formService: FormsTemplateService,
        private EOS: EditObjectService) {
        // Paths
        this.photoDir = null;
        this.notesDir = null;
        this.docDic = null;

        // Selections
        this.selectedFeatures = [];
        this.selectedObject = null;
        this.selectedObservation = null;

        this.abstract = {};

        // Prestations
        this.prestationMap = {};
        this.tempPrestation = null;
        this.allPrestationList = [];
        this.prestationList = [];

        // Desordres
        this.desordreMap = {};
        this.tempDesordre = null;
        this.allDesordreList = [];
        this.desordreList = [];

        // isDependance
        this.isDependance = false;
    }

    init() {
        if (this.selectedObject) {
            this.isDependance = PluginUtils.isDependanceAhDoc(this.selectedObject);
            this.abstract = {};
            const regex = new RegExp('.*Id$');
            for (let key in this.selectedObject) {
                if (regex.test(key)) {
                    const value = this.selectedObject[key];
                    this.localDB.get(value).then(
                        (doc) => {
                            this.abstract[key.substr(0, key.length - 2)] = this.formService.doc2String(doc);
                        },
                        (error) => {
                            console.log('No document found for this ID (' + value + '). ' + error);
                        }
                    );
                } else if (key.toLowerCase() === 'author') {
                    const value = this.selectedObject[key];
                    this.localDB.get(value).then(
                        (doc) => {
                            this.abstract['author'] = doc.login;
                        },
                        (error) => {
                            console.log('No document found for this author ID (' + value + '). ' + error);
                        }
                    );
                }
            }

            let prestationClass: string;
            if (this.isDependance) {
                prestationClass = 'fr.sirs.core.model.PrestationAmenagementHydraulique';
            } else {
                prestationClass = 'fr.sirs.core.model.Prestation';
            }

            this.localDB.query('Element/byClassAndLinear', {
                startkey: [prestationClass],
                endkey: [prestationClass, {}]
            }).then(
                (response) => {
                    this.prestationMap = {};
                    this.allPrestationList = response.map((elt) => {
                        this.prestationMap[elt.value.id] = elt.value.designation ? elt.value.designation + ' ' + (elt.value.libelle ? elt.value.libelle : '') : elt.value.id;
                        return elt.value;
                    });
                    this.filterPrestationList();
                    this.tempPrestation = null;
                }, (err) => {
                    console.error(err);
                }
            );

            let desordreClass: string;
            let linearId: string;
            if (this.isDependance) {
                desordreClass = 'fr.sirs.core.model.DesordreDependance';
                linearId = null;
            } else {
                desordreClass = 'fr.sirs.core.model.Desordre';
                linearId = this.selectedObject.linearId;
            }

            this.localDB.query('Element/byClassAndLinear', {
                startkey: [desordreClass, linearId],
                endkey: [desordreClass, linearId, {}]
            }).then(
                (response) => {
                    this.desordreMap = {};
                    this.allDesordreList = response.map((elt) => {
                        this.desordreMap[elt.value.id] = elt.value.designation ? elt.value.designation : elt.value.id;
                        return elt.value;
                    });
                    this.filterDesordreList();
                    this.tempDesordre = null;
                }, (err) => {
                    console.error(err);
                }
            );
        } else {
            console.warn("object-details.service: you must define selectedObject before init.");
        }
    }

    openObservationDetails(observation) {
        this.selectedObservation = observation;
        this.detailsType = 'observationDetails';
    }

    backToObjectDetails() {
        this.detailsType = 'objectDetails';
    }

    async openDesordreLink(id) {
        if (this.isDependance) {
            await this.EOS.init('DesordreDependance', id);
            this.route.navigateByUrl('/object/DesordreDependance/' + id);
        } else {
            await this.EOS.init('Desordre', id);
            this.route.navigateByUrl('/object/Desordre/' + id);
        }
    }

    addDesordre() {
        if (!this.tempDesordre) {
            return;
        }
        if (!this.selectedObject.desordreIds) {
            this.selectedObject.desordreIds = [];
        }
        this.selectedObject.desordreIds.push(this.tempDesordre);
        this.tempDesordre = null;
        this.filterDesordreList();
        this.selectedObject.valid = false;
        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
        this.selectedObject.editMode = true;
        this.editionService.saveObject(this.selectedObject)
            .then(() => {
                this.mapManagerService.syncAllAppLayer();
                this.mapManagerService.clearAll();
            });
    }

    async removeDesordre(index) {
        const alert = await this.alertCtrl.create({
            backdropDismiss: false,
            header: 'Suppression de l\'association',
            message: 'Voulez vous vraiment supprimer cette association ?',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.selectedObject.desordreIds.splice(index, 1);
                        if (this.selectedObject.desordreIds.length === 0) {
                            delete this.selectedObject.desordreIds;
                        }
                        this.selectedObject.valid = false;
                        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
                        this.selectedObject.editMode = true;
                        this.filterDesordreList();
                        this.editionService.saveObject(this.selectedObject)
                            .then(() => {
                                this.mapManagerService.syncAllAppLayer();
                                this.mapManagerService.clearAll();
                            });
                    }
                }
            ]
        });
        await alert.present();
    }

    filterDesordreList() {
        this.desordreList = this.allDesordreList.filter((item) => {
            return !this.selectedObject.desordreIds || this.selectedObject.desordreIds.indexOf(item.id) === -1;
        });
    }

    async openPrestationLink(id) {
        if (this.isDependance) {
            await this.EOS.init('PrestationAmenagementHydraulique', id);
            this.route.navigateByUrl('/object/PrestationAmenagementHydraulique/' + id);
        } else {
            await this.EOS.init('Prestation', id);
            this.route.navigateByUrl('/object/Prestation/' + id);
        }
    }

    addPrestation() {
        if (!this.tempPrestation) {
            return;
        }
        if (!this.selectedObject.prestationIds) {
            this.selectedObject.prestationIds = [];
        }
        this.selectedObject.prestationIds.push(this.tempPrestation);
        this.tempPrestation = null;
        this.filterPrestationList();
        this.selectedObject.valid = false;
        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
        this.selectedObject.editMode = true;
        this.editionService.saveObject(this.selectedObject)
            .then(() => {
                this.mapManagerService.syncAllAppLayer();
                this.mapManagerService.clearAll();
            });
    }

    async removePrestation(index) {
        const alert = await this.alertCtrl.create({
            backdropDismiss: false,
            header: 'Suppression de l\'association',
            message: 'Voulez vous vraiment supprimer cette association ?',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.selectedObject.prestationIds.splice(index, 1);
                        if (this.selectedObject.prestationIds.length === 0) {
                            delete this.selectedObject.prestationIds;
                        }
                        this.selectedObject.valid = false;
                        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
                        this.selectedObject.editMode = true;
                        this.filterPrestationList();
                        this.editionService.saveObject(this.selectedObject)
                            .then(() => {
                                this.mapManagerService.syncAllAppLayer();
                                this.mapManagerService.clearAll();
                            });
                    }
                }
            ]
        });
        await alert.present();
    }

    filterPrestationList() {
        this.prestationList = this.allPrestationList.filter((item) => {
            return !this.selectedObject.prestationIds || this.selectedObject.prestationIds.indexOf(item.id) === -1;
        });
    }

}
