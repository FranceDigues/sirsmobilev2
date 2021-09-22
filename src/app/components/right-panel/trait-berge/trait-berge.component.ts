import { Component, OnInit } from '@angular/core';
import { SirsDocService } from '../../../services/sirsdoc.service';
import { EditionModeService } from '../../../services/edition-mode.service';
import { AuthService } from '../../../services/auth.service';
import { LocalDatabase } from '../../../services/local-database.service';
import LineString from 'ol/geom/LineString';
import WKT from 'ol/format/WKT';
import { TrackerService } from '../../../services/tracker.service';

@Component({
    selector: 'trait-berge',
    templateUrl: './trait-berge.component.html',
    styleUrls: ['./trait-berge.component.scss'],
})
export class TraitBergeComponent implements OnInit {
    public dataProjection = this.sirsDoc.get().epsgCode;
    public wktFormat = new WKT();
    public refs;
    public tracking;
    public document;
    public coordinates = [];

    constructor(private sirsDoc: SirsDocService,
                private editionModeService: EditionModeService,
                private trackerService: TrackerService,
                private authService: AuthService,
                private localDatabase: LocalDatabase) {
    }

    ngOnInit() {
        this.editionModeService.getReferenceTypes()
            .then((refs) => {
                this.refs = refs;
            });

        this.tracking = (this.trackerService.getStatus() === 'on');
    }


    restoreTrackingState() {
        if (this.tracking) {
            this.coordinates = this.trackerService.getCoordinates();
            this.trackerService.getSubject()
                .subscribe({
                    next: (coordinates) => {
                        this.setCoordinates(coordinates);
                    },
                });
        }
    };

    startTracking() {
        this.coordinates = [];
        this.tracking = true;
        this.document = undefined;
        this.trackerService.start()
            .subscribe({
                next: (coordinates) => {
                    this.setCoordinates(coordinates);
                },
            });
    }


    abortTracking() {
        this.coordinates = [];
        this.tracking = false;
        this.trackerService.stop();
    }


    stopTracking() {
        this.tracking = false;
        this.document = {
            '@class': 'fr.sirs.core.model.TraitBerge',
            author: this.authService.getValue()._id,
            valid: false,
            geometry: this.serializeCoordinates(),
            date_debut: undefined,
            date_fin: undefined
        };
        const findIndex = this.refs.findIndex(item => item[0] === 'Berge');
        this.document.bergeId = this.document.bergeId || this.refs[findIndex][1].id;
        this.trackerService.stop();
    }


    saveDocument() {
        this.localDatabase.create(this.document)
            .then(() => {
                this.document = undefined;
            });
    }


    cancelDocument() {
        this.document = undefined;
    }


    setCoordinates(coordinates) {
        this.coordinates = coordinates;
    }

    serializeCoordinates() {
        const geometry = (new LineString(this.coordinates)).transform(this.dataProjection, 'EPSG:3857');
        return this.wktFormat.writeGeometry(geometry);
    }

}
