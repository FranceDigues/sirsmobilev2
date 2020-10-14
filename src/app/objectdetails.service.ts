import { Injectable } from '@angular/core';
import { LocalDatabase } from './usingLocalDatabase.service';
import { Router } from '@angular/router';

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

    abstract: Object;
    detailsType: 'objectDetails' | 'observationDetails';

    // Prestations
    prestationMap: Object;
    tempPrestation: Object;
    allPrestationList: Array<any>;
    prestationList: Array<any>;

    // Desordres
    desordreMap: Object;
    tempDesordre: Object;
    allDesordreList: Array<any>;
    desordreList: Array<any>;


    constructor(private localDB: LocalDatabase, private route: Router) {
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
        console.log('selectedObject what type ?', this.selectedObject);
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

    addDesordre(v) { // TODO

    }

    removeDesordre(index) { // TODO

    }

    filterDesordreList() {
        this.desordreList = this.allDesordreList.filter((item) => {
            return !this.selectedObject.desordreIds || this.selectedObject.desordreIds.indexOf(item.id) === -1;
        });
    }

    openPrestationLink(id) {
        this.route.navigateByUrl('/object/Prestation/' + id);
    }

    addPrestation(v) { // TODO
        
    }

    removePrestation(index) { // TODO

    }

    filterPrestationList() {
        this.prestationList = this.allPrestationList.filter((item) => {
            return !this.selectedObject.prestationIds || this.selectedObject.prestationIds.indexOf(item.id) === -1;
        });
    }

}
