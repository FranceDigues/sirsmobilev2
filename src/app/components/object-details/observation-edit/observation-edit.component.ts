import {
    Component,
    Directive,
    EventEmitter,
    OnInit,
    Output,
    ChangeDetectorRef,
    Pipe,
    PipeTransform
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObservationEditService } from 'src/app/services/observation-edit.service';
import { EditionModeService } from 'src/app/services/edition-mode.service';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../database-connection/models/database.model';
import { SirsDataService } from '../../../services/sirs-data.service';
import { UuidUtils } from '../../../utils/uuid-utils';
import { formatDate } from '@angular/common';
import { ObjectDetails } from '../../../services/object-details.service';
import { PluginUtils } from 'src/app/utils/plugin-utils';
import { AuthService } from "../../../services/auth.service";

enum ObservationEditTabs {
    medias = 'medias',
    evolution = 'evolution',
    urgence = 'urgence',
    nombre = 'nombre',
    suite = 'suite',
    observateur = 'observateur',
    suiteApporter = 'suiteApporter',
}

enum SpecificationTabs {
    etatOuvrageId = 'etatOuvrageId',
    etatAccessoireId = 'etatAccessoireId',
    etatGenieCivilId = 'etatGenieCivilId',
    manoeuvreOuvrageId = 'manoeuvreOuvrageId',
}


@Component({
    selector: 'app-observation-edit',
    templateUrl: './observation-edit.component.html',
    styleUrls: ['./observation-edit.component.scss'],
})
export class ObservationEditComponent implements OnInit {
    observation;
    objectId: string;
    obsId: string;
    objectType: string;
    objectDoc: any;
    isNewObject: boolean;
    view: 'form' | 'media';
    tab: ObservationEditTabs;
    tabSpecification: SpecificationTabs;
    showTextConfig: string;
    refUrgence;
    contactList;
    refSuiteApporter;
    saving = false; // Status to display a loading overlay if the observation is saving and waiting for a response.
    etatOuvAccGCList;
    manoeuvreOuvrageList;
    defaultObservateurId;

    constructor(private activeRoute: ActivatedRoute, public observationEditService: ObservationEditService,
                private cdr: ChangeDetectorRef, private databaseService: DatabaseService,
                private route: Router, private editionService: EditionModeService,
                private objectDetails: ObjectDetails, public sirsDataService: SirsDataService, private authService: AuthService) {
        this.objectId = this.activeRoute.snapshot.paramMap.get('objectId');
        this.obsId = this.activeRoute.snapshot.paramMap.get('obsId');
        this.isNewObject = !this.obsId;
        this.objectDoc = this.objectDetails.selectedObject;
        this.view = 'form';
        this.tab = ObservationEditTabs.medias;
        this.tabSpecification = SpecificationTabs.etatOuvrageId;
        this.objectType = PluginUtils.doc2Class(this.objectDoc);

        // Not optimized at all. Look for a way to init this properly or at the right time.
        this.observationEditService.init(this.objectId, this.obsId);

        this.sirsDataService.getContactList().then((list) => {
            this.contactList = list;
        }, (error) => {
            console.error('error contactList returned : ', error);
        });

        this.sirsDataService.getRefUrgence().then((list) => {
            this.refUrgence = list;
        }, (error) => {
            console.error('error ref urgence returned : ', error);
        });

        this.sirsDataService.getRefSuiteApporter().then((list) => {
            this.refSuiteApporter = list;
        }, (error) => {
            console.error('error ref suite apporter returned : ', error);
        });

        // SPECIFICATION RESEAU ET OUVRAGE
        // must appear after objecType initialization
        if (this.isReseauEtOuvrage()) {
            this.sirsDataService.getEtatOuvAccGCList().then((list) => {
                this.etatOuvAccGCList = list;
            }, (error) => {
                console.error('error etat ouverage returned : ', error);
            });

            this.sirsDataService.getManoeuvreOuvrageList().then((list) => {
                this.manoeuvreOuvrageList = list;
            }, (error) => {
                console.error('error manoeuvre ouverage returned : ', error);
            });
        }
    }

    ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.showTextConfig = config.context.showText;
                this.defaultObservateurId = config.context.defaultObservateurId;
                this.observation = this.obsId ? this.getObservationToEdit() : this.createNewObservation();
                this.observation.author = this.authService.user._id;
            });
    }

    createNewObservation() {
        const observation = {
            id: UuidUtils.generateUuid(),
            date: formatDate(Date.now(), 'yyyy-MM-dd', 'en-US'),
            observateurId: this.defaultObservateurId || '',
            photos: [],
            valid: false
        };

        switch (this.objectType) {
            case 'StationPompage':
            case 'ReseauHydrauliqueFerme':
            case 'OuvrageHydrauliqueAssocie':
            case 'ReseauHydrauliqueCielOuvert':
            case 'VoieAcces':
            case 'OuvrageFranchissement':
            case 'OuvertureBatardable':
            case 'VoieDigue':
            case 'OuvrageVoirie':
            case 'ReseauTelecomEnergie':
            case 'OuvrageTelecomEnergie':
            case 'OuvrageParticulier':
            case 'EchelleLimnimetrique':
            case 'Prestation':
                observation['@class'] = 'fr.sirs.core.model.Observation' + this.objectType;
                return observation;
            case 'DesordreDependance':
            case 'AmenagementHydraulique':
            case 'PrestationAmenagementHydraulique':
            case 'OrganeProtectionCollective':
            case 'StructureAmenagementHydraulique':
            case 'OuvrageAssocieAmenagementHydraulique':
                observation['@class'] = 'fr.sirs.core.model.ObservationDependance';
                return observation;
            default :
                observation['@class'] = 'fr.sirs.core.model.Observation';
                observation['urgenceId'] = 'RefUrgence:1';
                observation['nombreDesordres'] = 0;
                return observation;
        }
    }

    getObservationToEdit() {
        const find = this.objectDoc.observations
            .find(elt => elt.id === this.obsId);
        if (find) {
            return find;
        } else {
            throw new Error(`No observation found with id : ${this.obsId}`);
        }
    }

    setView(str: 'form' | 'media') {
        this.view = str;
        this.cdr.detectChanges();
    }

    // Todo make enum
    setTab(tab: ObservationEditTabs) {
        this.tab = tab;
    }

    setTabSpecification(tab: SpecificationTabs) {
        this.tabSpecification = tab;
    }

    goToMedia() {
        this.setView('media');
    }

    goMain() {
        //think about clear photos already taken
        this.route.navigateByUrl('/main');
    }

    showText(str: 'fullName' | 'abstract' | 'both') {
        return this.showTextConfig === str;
    }

    save() {
        this.saving = true;
        if (this.isNewObject) {
            // Add the new pictures to the new observation
            if (!this.observation.photos) this.observation.photos = [];
            this.observation.photos.push(...this.observationEditService.photos)
            // Add the new observation to observation list.
            if (!this.objectDoc.observations) this.objectDoc.observations = [];
            this.objectDoc.observations.push(this.observation);
        }
        this.objectDoc.valid = false;
        this.objectDoc.dateMaj = new Date().toISOString().split('T')[0];
        // check what is this flags with Sirs desktop
        delete this.objectDoc.prDebut;
        delete this.objectDoc.prFin;

        // Save document.
        this.editionService.updateObject(this.objectDoc).then(() => {
            this.saving = false;
            this.route.navigateByUrl('/main');
        });
    }

    parseUrgenceText(urgence) {
        switch (this.showTextConfig) {
            case 'fullName':
                return urgence.libelle ? urgence.libelle : 'libelle undefined / id: ' + urgence.id;
            case 'abstract':
                return urgence.abrege ? urgence.abrege : urgence.designation + ' : ' + urgence.libelle;
            case 'both':
                return urgence.abrege ? (urgence.abrege + ' : ' + urgence.libelle) : (urgence.designation + ' : ' + urgence.libelle);
            default:
                return '';
        }
    }

    parseContactName(observateur) {
        return observateur.doc.nom ? `${observateur.doc.nom} ${observateur.doc.prenom ? observateur.doc.prenom : ''}` : observateur.doc.designation;
    }

    parseSuiteApportertext(suiteApporter) {
        return suiteApporter.libelle ? suiteApporter.libelle : 'libelle undefined / id: ' + suiteApporter.id;
    }

    compareRef() {
        return (obj1, obj2) => {
            let a, b, comparison;
            comparison = 0;
            if (this.showText('fullName')) {
                a = obj1.libelle;
                b = obj2.libelle;
            } else {
                a = obj1.abrege ? obj1.abrege : obj1.designation;
                b = obj2.abrege ? obj2.abrege : obj2.designation;
            }

            if (a > b) {
                comparison = 1;
            } else if (a < b) {
                comparison = -1;
            }

            return comparison;
        }
    }

    private isReseauEtOuvrage() {
        return PluginUtils.isReseauOuvrageClass(this.objectType);
    }
}

@Directive({
    selector: '[ngInit]'
})
export class NgInitDirective implements OnInit {

    @Output() ngInit: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        this.ngInit.emit();
    }
}

@Pipe({
    name: 'sortByDocNom'
})
export class ArraySortPipe2 implements PipeTransform {

    transform(value: any, exponent: any) {
        return value ? value.sort(this.sortOn()) : '';
    }

    sortOn() {
        return (a, b) => {
            if (a.doc.nom && b.doc.nom) {
                if (a.doc.nom.toLowerCase() < b.doc.nom.toLowerCase()) {
                    return -1;
                } else if (a.doc.nom.toLowerCase() > b.doc.nom.toLowerCase()) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                if (a.doc.designation.toLowerCase() < b.doc.designation.toLowerCase()) {
                    return -1;
                } else if (a.doc.designation.toLowerCase() > b.doc.designation.toLowerCase()) {
                    return 1;
                } else {
                    return 0;
                }
            }
        };
    }
}
