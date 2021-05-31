import {
    AfterViewInit,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    ChangeDetectorRef,
    Pipe,
    PipeTransform
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObservationEditService } from 'src/app/services/observation-edit.service';
import { EditionModeService } from 'src/app/services/edition-mode.service';
import { MapManagerService } from 'src/app/services/map-manager.service';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../database-connection/models/database.model';

declare var M: any;

@Component({
    selector: 'app-observation-edit',
    templateUrl: './observation-edit.component.html',
    styleUrls: ['./observation-edit.component.scss'],
})
export class ObservationEditComponent implements OnInit, AfterViewInit {
    @ViewChild('tabs') tabsMaterialize: ElementRef;

    objectId: string;
    obsId: string;
    view: 'form' | 'media';
    tab: 'medias' | 'evolution' | 'urgence' | 'nombre' | 'suite' | 'observateur';
    showTextConfig: string;

    // Some elements of ObservationEditService are Promises so we have to wait until they are ready.
    init = {
        contactListInit: false
    }
    saving: boolean = false; // Status to display a loading overlay if the observation is saving and waiting for a response.


    constructor(private activeRoute: ActivatedRoute, public OES: ObservationEditService,
                private cdr: ChangeDetectorRef, private databaseService: DatabaseService,
                private route: Router, private editionService: EditionModeService,
                private mapManagerService: MapManagerService) {
        this.objectId = this.activeRoute.snapshot.paramMap.get('objectId');
        this.obsId = this.activeRoute.snapshot.paramMap.get('obsId');
        this.view = 'form';
        this.tab = 'medias';

        this.OES.init(this.objectId, this.obsId); // Not optimized at all. Look for a way to init this properly or at the right time.

        console.log("ObservationEditComponent OES : ", this.OES);

        this.OES.contactList.then(() => {
            this.init.contactListInit = true;
        }, () => {
            this.init.contactListInit = true;
        })

        // TODO CHECK inits -> doc.author + mb hidden inits
    }

    ngOnInit() {
        this.databaseService.getCurrentDatabaseSettings()
            .then((config: DatabaseModel) => {
                this.showTextConfig = config.context.showText;
            });
    }

    ngAfterViewInit() {
        const elem = this.tabsMaterialize.nativeElement;

        const options = {};
        new M.Tabs(elem, options); // initialize materialize tabs to show indicator
    }

    setView(str: 'form' | 'media') {
        this.view = str;
        this.cdr.detectChanges();
    }

    setTab(str: 'medias' | 'evolution' | 'urgence' | 'nombre' | 'suite' | 'observateur') {
        this.tab = str;
    }

    goToMedia() {
        this.setView('media');
    }

    goMain() {
        this.route.navigateByUrl('/main');
    }

    showText(str: 'fullName' | 'abstract' | 'both') {
        return this.showTextConfig === str;
    }

    save() {
        this.saving = true;
        if (this.OES.isNewObject) {
            if (this.OES.objectDoc.observations === undefined) {
                this.OES.objectDoc.observations = [];
            }

            // Push the new observation.
            const tmpDoc = Object.assign({}, this.OES.doc);
            this.OES.objectDoc.observations.push(tmpDoc);
        } else {
            // Apply modifications on target observation.
            const observation = this.OES.getTargetObservation();
            Object.assign(observation, this.OES.doc);
        }
        this.OES.objectDoc.valid = false;
        this.OES.objectDoc.editMode = true;
        this.OES.objectDoc.dateMaj = new Date().toISOString().split('T')[0];

        delete this.OES.objectDoc.prDebut;
        delete this.OES.objectDoc.prFin;

        if (this.OES.objectDoc.borneDebutId) {
            delete this.OES.objectDoc.positionDebut;
            delete this.OES.objectDoc.positionFin;
            delete this.OES.objectDoc.geometry;

            /**
             * Hack to calculate the approximate position when the object is aligned with bornes
             */
            if (!this.OES.objectDoc.approximatePositionDebut) {
                this.OES.getApproximatePosition(this.OES.objectDoc.borneDebutId,
                    this.OES.objectDoc.borne_debut_aval,
                    this.OES.objectDoc.borne_debut_distance, 'approximatePositionDebut')
                    .then(() => {
                        if (this.OES.objectDoc.borneFinId && !this.OES.objectDoc.approximatePositionFin) {
                            this.OES.getApproximatePosition(this.OES.objectDoc.borneFinId,
                                this.OES.objectDoc.borne_fin_aval,
                                this.OES.objectDoc.borne_fin_distance, 'approximatePositionFin')
                                .then(() => {
                                    // Save document.
                                    this.editionService.saveObject(this.OES.objectDoc).then(() => {
                                        this.saving = false;
                                        this.mapManagerService.syncAllAppLayer();
                                        this.route.navigateByUrl('/main');
                                    });
                                });
                        }
                    });
            } else {
                this.editionService.saveObject(this.OES.objectDoc).then(() => {
                    this.saving = false;
                    this.mapManagerService.syncAllAppLayer();
                    this.route.navigateByUrl('/main');
                });
            }
        } else {
            this.editionService.saveObject(this.OES.objectDoc).then(() => {
                this.saving = false;
                this.mapManagerService.syncAllAppLayer();
                this.route.navigateByUrl('/main');
            });
        }
    }

    changeUrgence() {
        this.OES.doc.urgenceId = 'RefUrgence:' + this.OES.urgence;
    }

    changeContact() {
        this.OES.doc.observateurId = this.OES.contact;
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
        const data = value.sort(this.sortOn());
        return data;
    }

    sortOn() {
        return (a, b) => {
            if (a.doc.nom.toLowerCase() < b.doc.nom.toLowerCase()) {
                return -1;
            } else if (a.doc.nom.toLowerCase() > b.doc.nom.toLowerCase()) {
                return 1;
            } else {
                return 0;
            }
        };
    }
}
