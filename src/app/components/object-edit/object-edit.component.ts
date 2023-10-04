import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { GeolocationService } from '../../services/geolocation.service';
import { PositionByBorneModalComponent } from './positionbyborne-modal/positionbyborne-modal.component';
import { SirsDataService } from '../../services/sirs-data.service';

@Component({
    selector: 'app-editobjects',
    templateUrl: './object-edit.component.html',
    styleUrls: ['./object-edit.component.scss'],
})
export class ObjectEditComponent implements OnInit {
    public tab = 'fields';
    public view = 'form';
    public objectDoc;
    public refTypes;
    public orientationList;
    public coteList;

    // * EOS for Edit Object Service -> to have better lisibility

    constructor(public EOS: EditObjectService,
                public geolocationService: GeolocationService,
                private router: Router,
                private alertCtrl: AlertController,
                private activatedRoute: ActivatedRoute,
                private modalCtrl: ModalController,
                private sirsDataService: SirsDataService) {
    }

    ngOnInit() {
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        const objectType = this.activatedRoute.snapshot.paramMap.get('type');
        this.EOS.init(objectType, id).then();
        this.refTypes = this.sirsDataService.refTypes;
        this.orientationList = this.sirsDataService.refOrientationPhoto;
        this.coteList = this.sirsDataService.refCote;
    }

    getStartPositionValue() {
        // Try to get GPS precision info
        const precisionGPSText = this.geolocationService.getGPSAccuracy() ? ', précision actuelle du GPS : +/- ' + this.geolocationService.getGPSAccuracy() + ' m' : '';

        return this.EOS.getStartPos() + precisionGPSText;
    }

    backToMain() {
        this.router.navigateByUrl('/main');
    }

    changeSlidePath(path: string) {
        this.view = path;
    }

    displayName(str: string) {
        for (let i = 1; i < str.length; i++) {
            const char = str.charAt(i);
            if (char !== `'` && i > 0) {
                if (char === char.toUpperCase()) {
                    str = str.slice(0, i) + ' ' + str.slice(i);
                    i++;
                    continue;
                }
            }
        }
        return str;
    }

    setTab(tab) {
        if (tab !== this.tab) {
            this.tab = tab;
        }
    }

    setView(view) {
        if (view !== this.view) {
            this.view = view;
        }
    }

    selectPos() {
        this.alertCtrl.create({
            header: 'Localisation manuelle',
            message: 'Voulez vous localiser l\'objet manuellement ? Cette opération va écraser les anciennes valeurs de localisation',
            backdropDismiss: false,
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: () => {
                        this.setView('map');
                    }
                }
            ]
        }).then(
            (alert) => {
                alert.present();
            }
        );
    }

    selectPosLine() {
        this.alertCtrl.create({
            header: 'Localisation manuelle',
            message: 'Voulez vous localiser l\'objet manuellement ? Cette opération va écraser les anciennes valeurs de localisation',
            backdropDismiss: false,
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: () => {
                        this.setView('drawLine');
                    }
                }
            ]
        }).then(
            (alert) => {
                alert.present();
            }
        );
    }

    private initData() {
        if (!this.EOS.objectDoc.systemeRepId) {
            return {
                systemeRepId: '',
                borne_debut_aval: '',
                borne_fin_aval: '',
                borne_aval: '',
                borne_debut_distance: 0,
                borne_fin_distance: 0,
                borne_distance: 0,
                borneDebutId: '',
                borneFinId: '',
                borneId: '',
                borneLibelle: '',
                borneDebutLibelle: '',
                borneFinLibelle: ''
            };
        } else if (!this.EOS.isLinear) {
            return {
                systemeRepId: this.EOS.objectDoc.systemeRepId,
                borne_debut_aval: this.EOS.objectDoc.borne_debut_aval ? 'true' : 'false',
                borne_debut_distance: this.EOS.objectDoc.borne_debut_distance,
                borneDebutId: this.EOS.objectDoc.borneDebutId,
                borneDebutLibelle: this.EOS.objectDoc.borneDebutLibelle || ''
            };
        } else {
            return {
                systemeRepId: this.EOS.objectDoc.systemeRepId,
                borne_debut_aval: this.EOS.objectDoc.borne_debut_aval ? 'true' : 'false',
                borne_fin_aval: this.EOS.objectDoc.borne_debut_aval ? 'true' : 'false',
                borne_debut_distance: this.EOS.objectDoc.borne_debut_distance || 0,
                borne_fin_distance: this.EOS.objectDoc.borne_fin_distance || 0,
                borneDebutId: this.EOS.objectDoc.borneDebutId || '',
                borneFinId: this.EOS.objectDoc.borneFinId || '',
                borneDebutLibelle: this.EOS.objectDoc.borneDebutLibelle || '',
                borneFinLibelle: this.EOS.objectDoc.borneFinLibelle || ''
            };
        }
    }

    async selectPosBySR() {
        const data = this.initData();
        const modal = await this.modalCtrl.create({
            component: PositionByBorneModalComponent,
            animated: true,
            cssClass: 'modal-css',
            componentProps: {
                data: data
            }
        });
        return await modal.present();
    }

    drawPolygon() {
        this.alertCtrl.create({
            header: 'Localisation manuelle',
            message: 'Voulez vous localiser l\'objet manuellement ? Cette opération va écraser les anciennes valeurs de localisation',
            backdropDismiss: false,
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: () => {
                        this.setView('drawPolygon');
                    }
                }
            ]
        }).then(
            (alert) => {
                alert.present();
            }
        );
    }

    private isAhObjectType() {
        return this.EOS.objectType === 'DesordreDependance'
            || this.EOS.objectType === 'PrestationAmenagementHydraulique'
            || this.EOS.objectType === 'StructureAmenagementHydraulique'
            || this.EOS.objectType === 'OuvrageAssocieAmenagementHydraulique'
            || this.EOS.objectType === 'OrganeProtectionCollective'
            || this.EOS.objectType === 'TraitAmenagementHydraulique';
    }

    private itChange(a) {
        this.EOS.objectDoc.amenagementHydrauliqueId = a.id;
    }

    private ahSelected(a) {
        return this.EOS.objectDoc.amenagementHydrauliqueId === a.id;
    }

    private isActiveTabs() {
        return this.EOS.type !== 'BorneDigue'
            && this.EOS.type !== 'Desordre'
            && this.EOS.type !== 'Berge'
            && !this.EOS.isDependance()
            && !this.EOS.isVegetation()
    }

    formatOptionText(obj) {
        switch (this.EOS.showTextConfig) {
            case 'fullName':
                return obj.libelle;
            case 'abstract':
                return obj.abrege ? obj.abrege
                    : (obj.designation + ' : ' + obj.libelle);
            default:
                return obj.abrege
                    ? (obj.abrege + ' : ' + obj.libelle)
                    : (obj.designation + ' : ' + obj.libelle);
        }

    }
}
