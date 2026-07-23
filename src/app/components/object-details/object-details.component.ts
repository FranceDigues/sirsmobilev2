import {
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    ElementRef,
    OnDestroy,
    ChangeDetectorRef
} from '@angular/core';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LocalDatabase } from '../../services/local-database.service';
import { SelectedObjectsService } from 'src/app/services/selected-objects.service';
import { EditionLayerService } from '../../services/edition-layer.service';
import { PluginUtils } from 'src/app/utils/plugin-utils';
import { AppLayersService } from "../../services/app-layers.service";
import { Memoize } from "typescript-memoize";
import { Subscription } from "rxjs";

declare var M: any;

@Component({
    selector: 'right-slide-details-objects',
    templateUrl: './object-details.component.html',
    styleUrls: ['./object-details.component.scss'],
})
export class ObjectDetailsComponent implements OnInit, OnDestroy {

    static observationsObjectType = [
        'Desordre',
        'StationPompage',
        'ReseauHydrauliqueFerme',
        'OuvrageHydrauliqueAssocie',
        'ReseauHydrauliqueCielOuvert',
        'VoieAcces',
        'OuvrageFranchissement',
        'OuvertureBatardable',
        'VoieDigue',
        'OuvrageVoirie',
        'ReseauTelecomEnergie',
        'OuvrageTelecomEnergie',
        'OuvrageParticulier',
        'Prestation',
        'EchelleLimnimetrique',
        'DesordreDependance',
        'PrestationAmenagementHydraulique',
        'OrganeProtectionCollective',
        'StructureAmenagementHydraulique',
        'OuvrageAssocieAmenagementHydraulique',
        'AmenagementHydraulique'
    ];
    static prestationsObjectType = [
        'StationPompage',
        'ReseauHydrauliqueFerme',
        'OuvrageHydrauliqueAssocie',
        'ReseauHydrauliqueCielOuvert',
        'VoieAcces',
        'OuvrageFranchissement',
        'OuvertureBatardable',
        'VoieDigue',
        'OuvrageVoirie',
        'ReseauTelecomEnergie',
        'OuvrageTelecomEnergie',
        'OuvrageParticulier',
        'EchelleLimnimetrique',
        'Desordre',
        'AmenagementHydraulique',
        'DesordreDependance'
    ];
    static desordreObjectType = [
        'StationPompage',
        'ReseauHydrauliqueFerme',
        'OuvrageHydrauliqueAssocie',
        'ReseauHydrauliqueCielOuvert',
        'VoieAcces',
        'OuvrageFranchissement',
        'OuvertureBatardable',
        'VoieDigue',
        'OuvrageVoirie',
        'ReseauTelecomEnergie',
        'OuvrageTelecomEnergie',
        'OuvrageParticulier',
        'Prestation',
        'EchelleLimnimetrique',
        'PrestationAmenagementHydraulique',
        'OuvrageAssocieAmenagementHydraulique',
        'AmenagementHydraulique'
    ];
    static photoObjectType = [
        'TronconDigue'
    ];
    static nonEditableDocumentClasses = [
        'fr.sirs.core.model.BorneDigue',
        'fr.sirs.core.model.TronconDigue',
        'fr.sirs.core.model.AmenagementHydraulique'
    ];

    @Output() readonly statusChange = new EventEmitter<string>();
    @ViewChild('tabs') tabsMaterialize: ElementRef;

    activeTab: 'description' | 'observations' | 'prestations' | 'desordres' | 'photos';
    document;
    objectType;
    isEditableLayer?: boolean;
    private layerUpdateSubscription?: Subscription;

    constructor(public objectDetails: ObjectDetails,
        private authService: AuthService,
        private route: Router,
        private alertCtrl: AlertController,
        private localDB: LocalDatabase,
        private editionLayerService: EditionLayerService,
        private selectedObjectsService: SelectedObjectsService,
        private changeDetectorRef: ChangeDetectorRef,
        private appLayersService: AppLayersService) {
        this.activeTab = 'description';
        this.objectDetails.detailsType = 'objectDetails';
        this.document = this.objectDetails.selectedObject;
        this.objectType = PluginUtils.doc2Class(this.document);
        this.objectDetails.init();
    }

    ngOnInit() {
        this._isEditableLayer().then(editable => this.isEditableLayer = editable);
        this.layerUpdateSubscription = this.appLayersService.onLayerChange.subscribe(() => {
            this._isEditableLayer().then(editable => this.isEditableLayer = editable);
        });
    }

    public ngOnDestroy(): void {
        if (this.layerUpdateSubscription) {
            this.layerUpdateSubscription.unsubscribe();
        }
    }

    goBack() {
        this.statusChange.emit('general');
    }

    setActiveTab(tab) {
        this.activeTab = tab;
        this.changeDetectorRef.markForCheck();
    }

    canShowTab() {
        return this.canShowObservationsTab() || this.canShowPrestationsTab() || this.canShowDesordresTab();
    }

    canShowObservationsTab() {
        return ObjectDetailsComponent.observationsObjectType.indexOf(this.objectType) !== -1;
    }

    canShowPhotosTab() {
        return ObjectDetailsComponent.photoObjectType.indexOf(this.objectType) !== -1;
    }

    canShowPrestationsTab() {
        return ObjectDetailsComponent.prestationsObjectType.indexOf(this.objectType) !== -1;
    }

    canShowDesordresTab() {
        return ObjectDetailsComponent.desordreObjectType.indexOf(this.objectType) !== -1;
    }

    private async _isEditableLayer(): Promise<boolean> {
        if (PluginUtils.isVegetationClass(this.document['@class'])) {
            const lastSegmentClass = this.getLastClassSegment(this.document['@class']);
            const refs = await this.localDB.query('Element/byClassAndLinear', {
                startkey: ['fr.sirs.core.model.RefType' + lastSegmentClass],
                endkey: ['fr.sirs.core.model.RefType' + lastSegmentClass, {}],
                include_docs: true
            });
            let layerName: string | undefined;

            for (const ref of refs) {
                if (ref.doc._id === this.document.typeVegetationId) {
                    layerName = ref.doc.libelle;
                }
            }

            if (layerName !== undefined) {
                for (const favorite of this.appLayersService.favorites.filter(item => item.filterValue === this.document['@class'])) {
                    if (favorite.title === layerName) {
                        return favorite.editable;
                    }
                }
            }
            return false;

        } else {
            return this.appLayersService.getLayerModel(this.document['@class'])
                && this.appLayersService.getLayerModel(this.document['@class']).editable;
        }
    }

    @Memoize()
    private getLastClassSegment(className: string): string {
        const segments: string[] = className.split('.');
        return segments[segments.length - 1];
    }

    canShowEditionButtons() {
        if (ObjectDetailsComponent.nonEditableDocumentClasses.indexOf(this.document['@class']) !== -1) {
            return false;
        }
        if (this.authService.getValue().role === 'USER' || this.authService.getValue().role === 'ADMIN') {
            return true;
        }
        if (this.authService.getValue().role === 'GUEST') {
            return false;
        }
        if (this.authService.getValue().role === 'EXTERN') {
            return this.document.author && this.authService.getValue()._id === this.document.author;
        }
    }

    canAddObservation() {
        return this.activeTab === 'observations' && this.authService.getValue().role !== 'GUEST';
    }

    canAddPhoto() {
        return this.activeTab === 'photos' && this.authService.getValue().role !== 'GUEST';
    }

    async editObject() {
        this.route.navigateByUrl('/object/' + this.objectType + '/' + this.document._id);
    }

    removeObject() {
        this.alertCtrl.create({
            header: 'Suppression d\'un object',
            message: 'Voulez-vous vraiment supprimer cet object ?',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: () => {
                        this.localDB.remove(this.document)
                            .then(
                                () => {
                                    let i = this.objectDetails.selectedFeatures.length;
                                    while (i--) {
                                        if (this.objectDetails.selectedFeatures[i].get('id') === this.document._id) {
                                            this.objectDetails.selectedFeatures.splice(i, 1);
                                            break;
                                        }
                                    }
                                    // Remove the selected features
                                    this.selectedObjectsService.deleteFeature(this.document._id);
                                    this.goBack();
                                    this.editionLayerService.redrawEditionLayerAfterSynchronization();
                                }
                            );
                    }
                }
            ]
        })
            .then(
                (alert) => {
                    alert.present();
                }
            );
    }

    async addObservation() {
        this.route.navigateByUrl('/observation/' + this.document._id.toString() + '/');
    }

    addPhoto() {
        this.route.navigateByUrl('/photo/' + this.document._id.toString() + '/');
    }
}
