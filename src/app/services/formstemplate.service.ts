import { Injectable } from '@angular/core';
import { EditObjectService } from './edit-object.service';
import { formTemplatePilote } from 'src/app/utils/form-template-pilote';

@Injectable({
    providedIn: 'root'
})
export class FormsTemplateService {

    constructor(private EOS: EditObjectService) { }

    initTalus() {
        this.initMateriauHaut();
        this.initMateriauBas();
        this.initNatureHaut();
        this.initNatureBas();
        this.initTopThickness();
        this.initInnerSlope();
        this.initTopLength();
        this.initLowLength();
        this.initTopFunction();
        this.initLowFunction();
        this.initCote();
    }

    initCategorie() {
        this.EOS.setupRef('categorieDesordreId', this.EOS.refs.RefCategorieDesordre[0]);
    }

    initCote() {
        this.EOS.setupRef('coteId', this.EOS.refs.RefCote[0]);
    }

    initDamPosition() {
        this.initPosition();
    }

    initDamSide() {
        this.initCote();
    }

    initFunction() {
        this.EOS.setupRef('fonctionId', this.EOS.refs.RefFonction[0]);
    }

    initGlissiere() {
        this.EOS.setupRef('typeGlissiereId', this.EOS.refs.RefTypeGlissiere[0]);
    }

    initHeightRef() {
        this.EOS.setupRef('referenceHauteurId', this.EOS.refs.RefReferenceHauteur[0]);
    }

    initInnerSlope() {
        this.EOS.objectDoc.penteInterieure = this.EOS.objectDoc.penteInterieure || 0;
    }

    initMaterial() {
        this.EOS.setupRef('materiauId', this.EOS.refs.RefMateriau[0]);
    }

    initMateriauHaut() {
        this.EOS.setupRef('materiauHautId', this.EOS.refs.RefMateriau[0]);
    }

    initMateriauBas() {
        this.EOS.setupRef('materiauBasId', this.EOS.refs.RefMateriau[0]);
    }

    initNature() {
        this.EOS.setupRef('natureId', this.EOS.refs.RefNature[0]);
    }

    initNatureHaut() {
        this.EOS.setupRef('natureHautId', this.EOS.refs.RefNature[0]);
    }

    initNatureBas() {
        this.EOS.setupRef('natureBasId', this.EOS.refs.RefNature[0]);
    }

    initOrientationOuvrage() {
        this.EOS.setupRef('orientationOuvrageId', this.EOS.refs.RefOrientationOuvrage[0]);
    }

    initOuvrageRevanche() {
        this.EOS.setupRef('ouvrageRevancheIds', this.EOS.refs.OuvrageRevanche[0], true);
    }

    initTopThickness() {
        this.EOS.objectDoc.epaisseurSommet = this.EOS.objectDoc.epaisseurSommet || 0;
    }

    initTopLength() {
        this.EOS.objectDoc.longueurRampantHaut = this.EOS.objectDoc.longueurRampantHaut || 0;
    }

    initLowLength() {
        this.EOS.objectDoc.longueurRampantBas = this.EOS.objectDoc.longueurRampantBas || 0;
    }

    initRevetementHaut() {
        this.EOS.setupRef('revetementHautId', this.EOS.refs.RefRevetement[0]);
    }

    initRevetementBas() {
        this.EOS.setupRef('revetementBasId', this.EOS.refs.RefRevetement[0]);
    }

    initSeuil() {
        this.EOS.setupRef('typeSeuilId', this.EOS.refs.RefSeuil[0]);
    }

    initTopFunction() {
        this.EOS.setupRef('fonctionHautId', this.EOS.refs.RefFonction[0]);
    }

    initTypeOuvrage() {
        this.EOS.setupRef('typeOuvrageFranchissementId', this.EOS.refs.RefOuvrageFranchissement[0]);
    }

    initUsage() {
        this.EOS.setupRef('usageId', this.EOS.refs.RefUsageVoie[0]);
    }

    initPosition() {
        this.EOS.setupRef('positionId', this.EOS.refs.RefPosition[0]);
    }

    initPositionHaut() {
        this.EOS.setupRef('positionHautId', this.EOS.refs.RefPosition[0]);
    }

    initPositionBas() {
        this.EOS.setupRef('positionBasId', this.EOS.refs.RefPosition[0]);
    }

    initHeight() {
        this.EOS.objectDoc.hauteurMurette = this.EOS.objectDoc.hauteurMurette || 0;
    }

    initWidth() {
        this.EOS.objectDoc.epaisseur = this.EOS.objectDoc.epaisseur || 0;
    }

    initLowFunction() {
        this.EOS.setupRef('fonctionBasId', this.EOS.refs.RefFonction[0]);
    }

    initFonctionnementAH() {
        this.EOS.setupRef('fonctionnementId', this.EOS.refs.RefFonctionnementAH[0]);
    }

    initTypeAH() {
        this.EOS.setupRef('typeId', this.EOS.refs.RefTypeAmenagementHydraulique[0]);
    }

    initTypeOrganeProtectionCollective() {
        this.EOS.setupRef('typeId', this.EOS.refs.RefTypeOrganeProtectionCollective[0]);
    }

    initEtat() {
        this.EOS.setupRef('etatId', this.EOS.refs.RefEtat[0]);
    }

    initOuvrageAssocieAH() {
        this.EOS.setupRef('typeId', this.EOS.refs.RefOuvrageAssocieAH[0]);
    }

    initFonctionnementOAAH() {
        this.EOS.setupRef('fonctionnementId', this.EOS.refs.RefFonctionnementOAAH[0]);
    }

    attributeNameOfObjectFromClass(objectType, clazz) {
        for (let key in formTemplatePilote[objectType]) {
            let value = formTemplatePilote[objectType][key];
            if (value.type === clazz) {
                return value.name;
            }
        }
        return null;
    }
}
