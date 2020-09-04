import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EditionLayer } from './layers.service';
import { MapService } from './map.service';
import { LocalDatabase } from './usingLocalDatabase.service';

@Injectable({
    providedIn: 'root'
})
export class EditionModeService {

    refTypes = [
        { name: 'Berge', include_docs: false },
        { name: 'EchelleLimnimetrique', include_docs: false },
        { name: 'OuvrageRevanche', include_docs: false },
        { name: 'OuvrageTelecomEnergie', include_docs: false },
        { name: 'RefCote', include_docs: false },
        { name: 'RefCategorieDesordre', include_docs: false },
        { name: 'RefConduiteFermee', include_docs: false },
        { name: 'RefEcoulement', include_docs: false },
        { name: 'RefFonction', include_docs: false },
        { name: 'RefImplantation', include_docs: false },
        { name: 'RefLargeurFrancBord', include_docs: false },
        { name: 'RefMateriau', include_docs: false },
        { name: 'RefNature', include_docs: false },
        { name: 'RefOuvrageFranchissement', include_docs: false },
        { name: 'RefOuvrageParticulier', include_docs: false },
        { name: 'RefOrientationOuvrage', include_docs: false },
        { name: 'RefOuvrageHydrauliqueAssocie', include_docs: false },
        { name: 'RefOuvrageTelecomEnergie', include_docs: false },
        { name: 'RefOuvrageVoirie', include_docs: false },
        { name: 'RefPosition', include_docs: false },
        { name: 'RefReferenceHauteur', include_docs: false },
        { name: 'RefRevetement', include_docs: false },
        { name: 'RefSeuil', include_docs: false },
        { name: 'RefTypeDesordre', include_docs: true },
        { name: 'RefTypeGlissiere', include_docs: false },
        { name: 'RefReseauHydroCielOuvert', include_docs: false },
        { name: 'RefReseauTelecomEnergie', include_docs: false },
        { name: 'RefUsageVoie', include_docs: false },
        { name: 'RefUtilisationConduite', include_docs: false },
        { name: 'RefVoieDigue', include_docs: false },
        { name: 'ReseauHydrauliqueFerme', include_docs: false },
        { name: 'ReseauTelecomEnergie', include_docs: false }
    ];

    constructor(private localDB: LocalDatabase, private authService: AuthService,
                private editionLayer: EditionLayer) { }

    newObject(type) {
        console.log(this.authService);
        const objectDoc: any = {
            '@class': 'fr.sirs.core.model.' + type,
            'author': this.authService.user._id,
            'valid': false,
            'linearId': null,
            'editMode': true
        };
        if (type !== 'Désordre') {
            objectDoc.photos = [];
        }
        return objectDoc;
    }

    saveObject(objectDoc) {
        return (this.localDB.save(objectDoc)
            .then(
                () => {
                    if (objectDoc.positionDebut && objectDoc.positionFin) {
                        const source = this.editionLayer.editionLayer.getSource()
                        const features = source.getFeatures();
                        let i = features.length;
                        while (i--) {
                            if (features[i].get('id') === objectDoc._id) {
                                features.splice(i, 1);
                                break;
                            }
                        }
                        source.addFeature(this.editionLayer.createEditionFeatureInstance(objectDoc));
                    }
                    return objectDoc;
                }
            ));
    }

    getClosableObjects() {
        return (this.localDB.query('objetsNonClosByBorne/byAuthor', {
                key: this.authService.user._id,
                include_docs: true
            }));
    }

    getClosedObjects() {
        return (this.localDB.query('objetsClosByBorne/byAuthor', {
            key: this.authService.user._id,
            include_docs: true
        }));
    }

    getEditionModeObjects3() {
        return (this.localDB.query('objetsModeEdition3/objetsModeEdition3', {
            include_docs: true
        }));
    }

    getEditionModeObjects5() {
        return (this.localDB.query('objetsModeEdition5/objetsModeEdition5', {
            include_docs: true
        }));
    }

    getReferenceTypes() {
        const promises = [];

        this.refTypes.forEach((refType) => {

            const classPath = 'fr.sirs.core.model.' + refType.name;
            const promise = new Promise((resolve, rejects) => {
                this.localDB.query('byClassAndLinearRef', {
                    startkey: [classPath],
                    endkey: [classPath, {}],
                    include_docs: refType.include_docs
                }).then(
                    (results) => {
                        const values = results.map((item) => { return refType.include_docs ? item.doc : item.value });
                        resolve(values);
                    },
                    (error) => {
                        rejects(error);
                    }
                );
            });
            promises[refType.name] = promise; // ? why an order
        });
        Promise.all(promises);
    }

}
