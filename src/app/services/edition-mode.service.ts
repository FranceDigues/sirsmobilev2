import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { LocalDatabase } from './local-database.service';
import { EditionLayerService } from './edition-layer.service';

@Injectable({
    providedIn: 'root'
})
export class EditionModeService {

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
        {name: 'RefSecurite', include_docs: false},
        {name: 'DesordreDependance', include_docs: false},
        {name: 'StructureAmenagementHydraulique', include_docs: false},
        {name: 'OuvrageAssocieAmenagementHydraulique', include_docs: false},
        {name: 'Organisme', include_docs: false},
        {name: 'TronconDigue', include_docs: false},
        {name: 'PrestationAmenagementHydraulique', include_docs: false},
        {name: 'Contact', include_docs: false},
        {name: 'Marche', include_docs: false},
        {name: 'RefEtatSanitaireVegetation', include_docs: false},
        {name: 'RefHauteurVegetation', include_docs: false},
        {name: 'RefDiametreVegetation', include_docs: false},
        {name: 'RefDensiteVegetation', include_docs: false},
        {name: 'RefTypeInvasiveVegetation', include_docs: false},
        {name: 'RefTypePeuplementVegetation', include_docs: false},
        {name: 'RefEspeceArbreVegetation', include_docs: false}
    ];

    constructor(private localDB: LocalDatabase, private authService: AuthService,
                private editionLayerService: EditionLayerService) {
    }

    newObject(type) {
        const objectDoc: any = {
            '@class': 'fr.sirs.core.model.' + type,
            author: this.authService.user._id,
            valid: false,
            linearId: null
        };
        if (type !== 'Désordre') {
            objectDoc.photos = [];
        }
        return objectDoc;
    }

    createObject(objectDoc) {
        objectDoc.createFromMobile = true;
        return (this.localDB.create(objectDoc)
            .then(
                (doc) => {
                    const source = this.editionLayerService.editionLayer.getSource();
                    source.addFeature(this.editionLayerService.createEditionFeatureInstance(doc));
                    return doc;
                }
            ));
    }

    updateObject(objectDoc, visible = true) {
        return (this.localDB.save(objectDoc)
            .then(
                () => {
                    const source = this.editionLayerService.editionLayer.getSource();
                    const features = source.getFeatures();
                    let i = features.length;
                    while (i--) {
                        if (features[i].get('id') === objectDoc._id) {
                            features.splice(i, 1);
                            break;
                        }
                    }
                    // Draw the feature in the map only if the layer model is visible
                    if (visible) {
                        source.addFeature(this.editionLayerService.createEditionFeatureInstance(objectDoc));
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
        return (this.localDB.query('objetsModeEdition8/objetsModeEdition8', {
            include_docs: true
        }));
    }

    getReferenceType(clazz: string, includeDocs: boolean = false) {
        const classPath = 'fr.sirs.core.model.' + clazz;
        return new Promise((resolve, rejects) => {
            this.localDB.query('byClassAndLinearRef', {
                startkey: [classPath],
                endkey: [classPath, {}],
                include_docs: includeDocs
            }).then(
                (results) => {
                    const values = results.map((item) => {
                        return includeDocs ? item.doc : item.value;
                    });
                    resolve(values);
                },
                (error) => {
                    rejects(error);
                }
            );
        });
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
                        const values = results.map((item) => {
                            return refType.include_docs ? item.doc : item.value;
                        });
                        resolve([refType.name, values]);
                    },
                    (error) => {
                        rejects([refType.name, error]);
                    }
                );
            });
            promises.push(promise);
        });
        return Promise.all(promises);
    }

}
