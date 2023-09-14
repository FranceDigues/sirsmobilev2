import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { SirsDoc } from '../models/SirsDoc';
import { File } from '@ionic-native/file/ngx';

@Injectable({
    providedIn: 'root'
})
export class SirsDataService {
    sirsDoc: SirsDoc;
    contactList;
    urgenceList;
    refOrientationPhoto;
    refCote;
    refUrgence;
    refSuiteApporter;
    etatOuvAccGCList;
    manoeuvreOuvrageList;
    mediaPath: string;
    refTypes = [
        {name: 'Berge', include_docs: false},
        {name: 'EchelleLimnimetrique', include_docs: false},
        {name: 'OuvrageRevanche', include_docs: false},
        {name: 'OuvrageTelecomEnergie', include_docs: false},
        {name: 'RefCote', include_docs: false},
        {name: 'RefCategorieDesordre', include_docs: false},
        {name: 'RefConduiteFermee', include_docs: false},
        {name: 'RefEcoulement', include_docs: false},
        {name: 'RefFonction', include_docs: false},
        {name: 'RefImplantation', include_docs: false},
        {name: 'RefLargeurFrancBord', include_docs: false},
        {name: 'RefMateriau', include_docs: false},
        {name: 'RefNature', include_docs: false},
        {name: 'RefOuvrageFranchissement', include_docs: false},
        {name: 'RefOuvrageParticulier', include_docs: false},
        {name: 'RefOrientationOuvrage', include_docs: false},
        {name: 'RefOuvrageHydrauliqueAssocie', include_docs: false},
        {name: 'RefOuvrageTelecomEnergie', include_docs: false},
        {name: 'RefOuvrageVoirie', include_docs: false},
        {name: 'RefPosition', include_docs: false},
        {name: 'RefPrestation', include_docs: false},
        {name: 'RefReferenceHauteur', include_docs: false},
        {name: 'RefRevetement', include_docs: false},
        {name: 'RefSeuil', include_docs: false},
        {name: 'RefSource', include_docs: false},
        {name: 'RefTypeDesordre', include_docs: true},
        {name: 'RefTypeGlissiere', include_docs: false},
        {name: 'RefReseauHydroCielOuvert', include_docs: false},
        {name: 'RefReseauTelecomEnergie', include_docs: false},
        {name: 'RefUsageVoie', include_docs: false},
        {name: 'RefUtilisationConduite', include_docs: false},
        {name: 'RefVoieDigue', include_docs: false},
        {name: 'ReseauHydrauliqueFerme', include_docs: false},
        {name: 'ReseauTelecomEnergie', include_docs: false},
        {name: 'RefFonctionnementAH', include_docs: false},
        {name: 'RefTypeOrganeProtectionCollective', include_docs: false},
        {name: 'RefTypeAmenagementHydraulique', include_docs: false},
        {name: 'RefEtat', include_docs: false},
        {name: 'RefOuvrageAssocieAH', include_docs: false},
        {name: 'RefFonctionnementOAAH', include_docs: false},
        {name: 'DesordreDependance', include_docs: false},
        {name: 'StructureAmenagementHydraulique', include_docs: false},
        {name: 'OuvrageAssocieAmenagementHydraulique', include_docs: false},
        {name: 'Organisme', include_docs: false},
        {name: 'TronconDigue', include_docs: false},
        {name: 'PrestationAmenagementHydraulique', include_docs: false},
        {name: 'Contact', include_docs: false},
        {name: 'Marche', include_docs: false}
    ];

    constructor(private localDB: LocalDatabase, private file: File) {
        this.mediaPath = `${this.file.dataDirectory}medias`;
    }

    getSirsDoc(): Promise<SirsDoc> {
        return new Promise((resolve, reject) => {
            if (this.sirsDoc) {
                resolve(this.sirsDoc);
            } else {
                this.localDB.get('$sirs').then(
                    (doc) => {
                        this.sirsDoc = doc;
                        resolve(doc);
                    },
                    (error) => {
                        console.error('SirsDocService get error : ', error);
                        reject(error);
                    }
                );
            }
        });
    }

    getContactList() {
        return new Promise((resolve, reject) => {
            if (!this.contactList) {
                this.localDB.query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.Contact'],
                    endkey: ['fr.sirs.core.model.Contact', {}],
                    include_docs: true
                }).then((list) => {
                    this.contactList = list;
                    resolve(list);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve(this.contactList);
            }
        });
    }

    getRefOrientationPhoto() {
        return new Promise((resolve, reject) => {
            if (!this.refOrientationPhoto) {
                this.localDB.query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.RefOrientationPhoto'],
                    endkey: ['fr.sirs.core.model.RefOrientationPhoto', {}],
                    include_docs: true
                }).then((list) => {
                    this.refOrientationPhoto = list;
                    resolve(list);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve(this.refOrientationPhoto);
            }
        });
    }

    getRefCote() {
        return new Promise((resolve, reject) => {
            if (!this.refCote) {
                this.localDB.query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.RefCote'],
                    endkey: ['fr.sirs.core.model.RefCote', {}],
                    include_docs: true
                }).then((list) => {
                    this.refCote = list;
                    resolve(list);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve(this.refCote);
            }
        });
    }

    getRefUrgence() {
        return new Promise((resolve, reject) => {
            if (!this.refUrgence) {
                this.localDB.query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.RefUrgence'],
                    endkey: ['fr.sirs.core.model.RefUrgence', {}],
                    include_docs: true
                }).then((list) => {
                    this.refUrgence = list.map(item => {
                        if (item.doc && item.doc.abrege) {
                            item.value.abrege = item.doc.abrege;
                        }
                        return item.value;
                    });
                    resolve(this.refUrgence);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve(this.refUrgence);
            }
        });
    }

    async getRefSuiteApporter() {
        try {
            const result = await this.localDB.query('Element/byClassAndLinear', {
                startkey: ['fr.sirs.core.model.RefSuiteApporter'],
                endkey: ['fr.sirs.core.model.RefSuiteApporter', {}],
                include_docs: true
            });
            this.refSuiteApporter = result.map(item => {
                return item.value;
            });
            return this.refSuiteApporter;
        } catch (err) {
            console.error(err);
        }
    }

    getEtatOuvAccGCList() {
        return new Promise((resolve, reject) => {
            if (!this.etatOuvAccGCList) {
                this.localDB.query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.RefEtatOuvAccGC'],
                    endkey: ['fr.sirs.core.model.RefEtatOuvAccGC', {}],
                    include_docs: true
                }).then((list) => {
                    this.etatOuvAccGCList = list.map(item => {
                        return item.value;
                    });
                    resolve(this.etatOuvAccGCList);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve(this.etatOuvAccGCList);
            }
        });
    }

    getManoeuvreOuvrageList() {
        return new Promise((resolve, reject) => {
            if (!this.manoeuvreOuvrageList) {
                this.localDB.query('Element/byClassAndLinear', {
                    startkey: ['fr.sirs.core.model.RefManoeuvre'],
                    endkey: ['fr.sirs.core.model.RefManoeuvre', {}],
                    include_docs: true
                }).then((list) => {
                    this.manoeuvreOuvrageList = list.map(item => {
                        return item.value;
                    });
                    resolve(this.manoeuvreOuvrageList);
                }, (error) => {
                    reject(error);
                });
            } else {
                resolve(this.manoeuvreOuvrageList);
            }
        });
    }

    async loadDataFromDB() {
        const sirsDoc = await this.getSirsDoc();
        proj4.defs(sirsDoc.epsgCode, sirsDoc.proj4);
        register(proj4);
        await this.getRefOrientationPhoto();
        await this.getRefCote();
        await this.getContactList();
        await this.getRefUrgence();
        await this.getRefSuiteApporter();
        await this.getEtatOuvAccGCList();
        await this.getManoeuvreOuvrageList();
    }

}
