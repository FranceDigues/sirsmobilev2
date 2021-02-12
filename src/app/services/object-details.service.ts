import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { Router } from '@angular/router';
import { EditionModeService } from './edition-mode.service';
import { MapManagerService } from './map-manager.service';
import { AlertController } from '@ionic/angular';

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


    constructor(private localDB: LocalDatabase, private route: Router,
                private editionService: EditionModeService, private mapManagerService: MapManagerService,
                private alertCtrl: AlertController) {
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
        this.tempPrestation = { v: null };
        this.allPrestationList = [];
        this.prestationList = [];

        // Desordres
        this.desordreMap = {};
        this.tempDesordre = { v: null };
        this.allDesordreList = [];
        this.desordreList = [];
    }

    init() {
        const regex = new RegExp('.*Id$');
        for (let key in this.selectedObject) {
            if (regex.test(key)) {
                const value = this.selectedObject[key];
                this.localDB.get(value).then(
                    (doc) => {
                        this.abstract[key.substr(0, key.length - 2)] = doc.libelle;
                    }
                );
            }
        }

        this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.Prestation'],
            endkey: ['fr.sirs.core.model.Prestation', {}]
        }).then(
            (response) => {
                this.prestationMap = {};
                this.allPrestationList = response.map((elt) => {
                    this.prestationMap[elt.value.id] = elt.value.designation ? elt.value.designation : elt.value.id;
                    return elt.value;
                });
                this.filterPrestationList();
                this.tempPrestation = { v: null };
            }, (err) => {
                console.error(err);
            }
        );

        this.localDB.query('Element/byClassAndLinear', {
            startkey: ['fr.sirs.core.model.Desordre', this.selectedObject.linearId],
            endkey: ['fr.sirs.core.model.Desordre', this.selectedObject.linearId, {}]
        }).then(
            (response) => {
                this.desordreMap = {};
                this.allDesordreList = response.map((elt) => {
                    this.desordreMap[elt.value.id] = elt.value.designation ? elt.value.designation : elt.value.id;
                    return elt.value;
                });
                this.filterDesordreList();
                this.tempDesordre = { v: null };
            }, (err) => {
                console.error(err);
            }
        );
    }

    openObservationDetails(observation) {
        this.selectedObservation = observation;
        this.detailsType = 'observationDetails';
    }

    backToObjectDetails() {
        this.detailsType = 'objectDetails';
    }

    openDesordreLink(id) {
        this.route.navigateByUrl('/object/Desordre/' + id);
    }

    addDesordre(v) {
        if (!v) {
            return;
        }

        let did = Object.keys(this.desordreMap).filter((key) => {
            return this.desordreMap[key] === v;
        })[0];

        if (!this.selectedObject.desordreIds) {
            this.selectedObject.desordreIds = [];
        }
        this.selectedObject.desordreIds.push(did);
        this.filterDesordreList();

        this.selectedObject.valid = false;

        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];

        this.selectedObject.editMode = true;

        this.editionService.saveObject(this.selectedObject)
        .then(() => {
            this.tempDesordre.v = null;
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

    openPrestationLink(id) {
        this.route.navigateByUrl('/object/Prestation/' + id);
    }

    addPrestation(v) {
        if (!v) {
            return;
        }

        let pid = Object.keys(this.prestationMap).filter((key) => {
            return this.prestationMap[key] === v;
        })[0];

        if (!this.selectedObject.prestationIds) {
            this.selectedObject.prestationIds = [];
        }
        this.selectedObject.prestationIds.push(pid);
        this.filterPrestationList();

        this.selectedObject.valid = false;

        this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];

        this.selectedObject.editMode = true;

        this.tempPrestation.v = null;

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
