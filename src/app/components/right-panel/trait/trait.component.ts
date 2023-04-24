import { Component, OnInit } from '@angular/core';
import { EditionModeService } from '../../../services/edition-mode.service';
import { AuthService } from '../../../services/auth.service';
import { LocalDatabase } from '../../../services/local-database.service';
import LineString from 'ol/geom/LineString';
import WKT from 'ol/format/WKT';
import { TrackerService } from '../../../services/tracker.service';
import {SirsDataService} from "../../../services/sirs-data.service";

@Component({
    selector: 'trait',
    templateUrl: './trait.component.html',
    styleUrls: ['./trait.component.scss'],
})
export class TraitComponent implements OnInit {

    public dataProjection = this.sirsDataService.sirsDoc.epsgCode;
    public wktFormat = new WKT();
    public tracking;
    public document;
    public coordinates = [];

    traitList = [
      {
        "class": "TraitBerge",
        "parent": "Berge",
        "label": "Trait de berge",
        "attributeReference": "bergeId"
      },
      {
        "class": "TraitAmenagementHydraulique",
        "parent": "AmenagementHydraulique",
        "label": "Trait d'aménagement hydraulique",
        "attributeReference": "amenagementHydrauliqueId"
      }
    ];
    trait = null;

    constructor(private sirsDataService: SirsDataService,
                private editionModeService: EditionModeService,
                private trackerService: TrackerService,
                private authService: AuthService,
                private localDatabase: LocalDatabase) {
    }

    ngOnInit() {
        for (const t of this.traitList) {
            this.editionModeService.getReferenceType(t.parent)
                .then((values) => {
                    t['parentValues'] = values;
                });
        }

        this.tracking = (this.trackerService.getStatus() === 'on');
        this.trait = this.traitList[0];
    }


    selectTrait(trait) {
      this.trait = trait;
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
        if (this.coordinates.length <= 1) {
            console.log("Gps coordinates must contains at least 2 points.");
            return;
        }
        this.tracking = false;
        this.document = {
            '@class': 'fr.sirs.core.model.' + this.trait.class,
            author: this.authService.getValue()._id,
            valid: false,
            geometry: this.serializeCoordinates(),
            date_debut: undefined,
            date_fin: undefined
        };
        this.document[this.trait.attributeReference] = undefined;
        this.trackerService.stop();
    }


    saveDocument() {
        this.document.createFromMobile = true;
        this.localDatabase.create(this.document)
            .then(() => {
                this.document = undefined;
            });
        //TODO Add layer to map ?? (like edit-mode.service)
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
