import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { Router } from '@angular/router';
import { EditionModeService } from './edition-mode.service';
import { MapManagerService } from './map-manager.service';
import { AlertController } from '@ionic/angular';
import { FormsTemplateService } from './formstemplate.service';
import { PluginUtils } from '../utils/plugin-utils';
import { DocToStringPipe } from "../pipe/doc-to-string/doc-to-string.pipe";
import { AppLayersService } from "./app-layers.service";

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
    selectedPhoto;

    abstract;
    detailsType: 'objectDetails' | 'observationDetails' | 'photoDetails';

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

    // isDeletable
    isDeletable: boolean;

    constructor(private localDB: LocalDatabase, private route: Router,
        private editionService: EditionModeService, private mapManagerService: MapManagerService,
        private alertCtrl: AlertController, private formService: FormsTemplateService,
        private docToStringPipe: DocToStringPipe,
                private appLayersService: AppLayersService) {
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

        // is deletable
        this.isDeletable = false;
    }

    init() {
        if (this.selectedObject) {
            let prestationClass: string;
            let desordreClass: string;
            let linearId: string;
            this.isDependance = PluginUtils.isDependanceAhDoc(this.selectedObject);

            this.initDisplayedValuesForReferences();
            if (this.isDependance) {
                prestationClass = 'fr.sirs.core.model.PrestationAmenagementHydraulique';
                linearId = null;
            } else if (this.selectedObject['@class'] === 'fr.sirs.core.model.Photo') {
                prestationClass = 'fr.sirs.core.model.Prestation';
                linearId = null;
            } else {
                prestationClass = 'fr.sirs.core.model.Prestation';
                linearId = this.selectedObject.linearId;
            }
            this.initPrestation(prestationClass, linearId);
            this.initDesordre(prestationClass, linearId);
            this.initIsDeletable();
        } else {
            console.error("Unexpected behavior: you must define selectedObject before initialization.");
        }
    }

    /*
     * selectedObject must be initialized before using this method.
     */
    private initDisplayedValuesForReferences() {
        this.abstract = {};
        const regex = new RegExp('.*Id$');
        for (let key in this.selectedObject) {
            if (regex.test(key)) {
                const value = this.selectedObject[key];
                this.localDB.get(value).then(
                    (doc) => {
                        this.abstract[key.substr(0, key.length - 2)] = this.docToStringPipe.transform(doc);
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
    }

    private initPrestation(prestationClass, linearId) {
        this.localDB.query('Element/byClassAndLinear', {
            startkey: [prestationClass, linearId],
            endkey: [prestationClass, linearId, {}]
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
    }

    private initDesordre(desordreClass, linearId) {
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
    }

    /*
     * /!\ selectedObject must be initialized before using this method. /!\
     */
    private initIsDeletable() {
        //delete createFromMobile attribute if object are already validate
        if (this.selectedObject.valid === true && this.selectedObject.createFromMobile) {
            delete this.selectedObject.createFromMobile;
            this.localDB.save(this.selectedObject);
        }
        if (this.selectedObject.createFromMobile === true) {
            this.isDeletable = true;
        } else {
            this.isDeletable = false;
        }
    }

    openObservationDetails(observation) {
        this.selectedObservation = observation;
        this.detailsType = 'observationDetails';
    }

    openPhotoDetails(photo) {
        this.selectedPhoto = photo;
        this.detailsType = 'photoDetails';
    }

    backToObjectDetails() {
        this.detailsType = 'objectDetails';
    }

    openDesordreLink(id) {
        if (this.isDependance) {
            this.route.navigateByUrl('/object/DesordreDependance/' + id);
        } else {
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
        this.editionService.updateObject(this.selectedObject)
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
                        this.filterDesordreList();
                        this.editionService.updateObject(this.selectedObject)
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

    openPrestationLink(id) {
        if (this.isDependance) {
            this.route.navigateByUrl('/object/PrestationAmenagementHydraulique/' + id);
        } else {
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
        this.filterPrestationList();
        // Make the doc in edit mode
        this.selectedObject.valid = false;
        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
        this.editionService.updateObject(this.selectedObject)
            .then();

        // Reciproque ajout dans l'objet prestation
        let clazz = PluginUtils.doc2Class(this.selectedObject);
        let attribute;
        if (this.isDependance) {
            attribute = this.formService.attributeNameOfObjectFromClass("PrestationAmenagementHydraulique", clazz);
        } else {
            attribute = this.formService.attributeNameOfObjectFromClass("Prestation", clazz);
        }
        const regex = /.*Ids$/;
        if (regex.test(attribute)) {
            this.addObjectId(this.tempPrestation, this.selectedObject["_id"], attribute);
        }

        // reset temporary prestation
        this.tempPrestation = null;
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
                        let removedIds = this.selectedObject.prestationIds.splice(index, 1);
                        if (this.selectedObject.prestationIds.length === 0) {
                            delete this.selectedObject.prestationIds;
                        }
                        this.selectedObject.valid = false;
                        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
                        this.filterPrestationList();
                        this.editionService.updateObject(this.selectedObject)
                            .then();

                        // Reciproque suppression dans l'objet prestation
                        if (removedIds && removedIds.length == 1) {
                            let clazz = PluginUtils.doc2Class(this.selectedObject);
                            let attribute;
                            if (this.isDependance) {
                                attribute = this.formService.attributeNameOfObjectFromClass("PrestationAmenagementHydraulique", clazz);
                            } else {
                                attribute = this.formService.attributeNameOfObjectFromClass("Prestation", clazz);
                            }
                            const regex = new RegExp('.*Ids$');
                            if (regex.test(attribute)) {
                                this.removeObjectId(removedIds[0], this.selectedObject["_id"], attribute);
                            }
                        }
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

    private addObjectId(receiverId, idToAdd, attribute) {
        this.localDB.get(receiverId)
            .then(
                (doc) => {
                    if (doc) {
                        if (doc[attribute]) {
                            doc[attribute].push(idToAdd);
                        } else {
                            doc[attribute] = [idToAdd];
                        }
                        doc.valid = false;
                        doc.dateMaj = new Date().toISOString().split('T')[0];
                        // Check if the layer model is visible or not
                        const isVisible = !!this.appLayersService.getFavorites().find(item => item.filterValue === doc['@class']);
                        this.editionService.updateObject(doc, isVisible)
                            .then();
                    } else {
                        console.error("Document (" + receiverId + ") not found.");
                    }
                },
                (err) => {
                    throw new Error(err);
                }
            );
    }

    private removeObjectId(receiverId, idToRemove, attribute) {
        this.localDB.get(receiverId)
            .then((doc) => {
                if (doc) {
                    if (doc[attribute] && Array.isArray(doc[attribute]) && doc[attribute].indexOf(idToRemove) != -1) {
                        doc[attribute].splice(doc[attribute].indexOf(idToRemove), 1);
                    }
                    doc.valid = false;
                    doc.dateMaj = new Date().toISOString().split('T')[0];
                    // Check if the layer model is visible or not
                    const isVisible = !!this.appLayersService.getFavorites().find(item => item.filterValue === doc['@class']);
                    this.editionService.updateObject(doc, isVisible)
                        .then();
                } else {
                    console.error("Document (" + receiverId + ") not found.");
                }
            },
                (err) => {
                    throw new Error(err);
                }
            );
    }
}
