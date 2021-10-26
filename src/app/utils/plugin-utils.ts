

export class PluginUtils {

    constructor () {}

    static isDependanceClass(strClass: string) {
        const isDependanceElement = strClass.toLowerCase().indexOf('dependance') > -1;
        const isAmenagementHydrauliqueElement = strClass.toLowerCase().indexOf('amenagementhydraulique') > -1
        || strClass.toLowerCase() === 'organeprotectioncollective';
        return isDependanceElement || isAmenagementHydrauliqueElement;
    }
}