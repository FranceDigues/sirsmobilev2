export class PluginUtils {

    static reseauOuvrageObjectType = [
        'ReseauHydrauliqueFerme',
        'OuvrageHydrauliqueAssocie',
        'ReseauHydrauliqueCielOuvert',
        'StationPompage',
        'OuvrageTelecomEnergie',
        'ReseauTelecomEnergie',
        'OuvrageParticulier',
        'EchelleLimnimetrique'
    ]

    constructor () {}

    static isDependanceAhClass(strClass: string) {
        const isDependanceElement = strClass.toLowerCase().indexOf('dependance') > -1;
        const isAmenagementHydrauliqueElement = strClass.toLowerCase().indexOf('amenagementhydraulique') > -1
        || strClass.toLowerCase() === 'fr.sirs.core.model.organeprotectioncollective';
        return isDependanceElement || isAmenagementHydrauliqueElement;
    }

    static isDependanceAhDoc(doc) {
        if (doc['@class']) {
            return PluginUtils.isDependanceAhClass(doc['@class']);
        } else {
            console.warn("isDependanceAhDoc: the object provide does not contains the attribut @class");
            return false;
        }
    }

    static isVegetationClass(strClass: string): boolean {
        return strClass === 'fr.sirs.core.model.ArbreVegetation'
            || strClass === 'fr.sirs.core.model.HerbaceeVegetation'
            || strClass === 'fr.sirs.core.model.InvasiveVegetation'
            || strClass === 'fr.sirs.core.model.PeuplementVegetation';
    }

    static isParcelleVegetationClass(strClass: string): boolean {
        return strClass === 'fr.sirs.core.model.ParcelleVegetation'
    }

    static isVegetationDoc(doc) {
        if (doc['@class']) {
            return PluginUtils.isVegetationClass(doc['@class']);
        } else {
            console.warn("The object provided does not contain the attribut @class");
            return false;
        }
    }

    static doc2Class(doc) {
        return doc['@class'].substring(doc['@class'].lastIndexOf('.') + 1);
    }

    static isReseauOuvrageClass(strClass: string) {
        return PluginUtils.reseauOuvrageObjectType.indexOf(strClass) !== -1
    }

    static isReseauOuvrageDoc(doc) {
        if (doc['@class']) {
            let clazz = PluginUtils.doc2Class(doc);
            return PluginUtils.isReseauOuvrageClass(clazz);
        } else {
            return false;
        }
    }
}