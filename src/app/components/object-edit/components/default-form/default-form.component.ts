import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { EditObjectService } from "../../../../services/edit-object.service";
import { GeolocationService } from "../../../../services/geolocation.service";
import {AppTronconsService} from "../../../../services/troncon.service";
import {clear as clearMemoize} from "typescript-memoize";
import {StorageService} from "@ionic-lib/lib-storage/storage.service";

@Component({
    selector: 'app-default-form',
    templateUrl: './default-form.component.html',
    styleUrls: ['./default-form.component.scss'],
})
export class DefaultFormComponent implements OnInit {
    @Output() selectPosEvent = new EventEmitter<string>();
    @Output() selectPosBySREvent = new EventEmitter<string>();

    tronconsLit: any[] = [];
    selectedTronconLitId: any;

    constructor(public EOS: EditObjectService, public appTronconsService: AppTronconsService, public storageService: StorageService,
                public geolocationService: GeolocationService) {
    }

    public selectPos(): void {
        this.selectPosEvent.emit('selectPos');
    }

    public selectPosBySR(): void {
        this.selectPosBySREvent.emit('selectPosBySREvent');
    }

    public getStartPositionValue(): string {
        // Try to get GPS precision info
        const precisionGPSText = this.geolocationService.getGPSAccuracy() ? ', précision actuelle du GPS : +/- ' + this.geolocationService.getGPSAccuracy() + ' m' : '';

        return this.EOS.getStartPos() + precisionGPSText;
    }

    ngOnInit(): void {
        this.loadTronconsLit();
    }

    public getTronconDigues(){
        // Exclure les tronçons présents dans tronconsLit
        const tronconDigues = this.EOS.troncons.filter(troncon =>
            !this.tronconsLit.some(tronconLit => tronconLit._id === troncon.id)
        );

        return tronconDigues;
    }
    public isLitClass(strClass: string): boolean {
        return strClass === 'fr.sirs.core.model.AutreOuvrageLit'
            || strClass === 'fr.sirs.core.model.DesordreLit'
            || strClass === 'fr.sirs.core.model.DomanialiteLit'
            || strClass === 'fr.sirs.core.model.IleBancLit'
            || strClass === 'fr.sirs.core.model.LargeurLit'
            || strClass === 'fr.sirs.core.model.OccupationRiveraineLit'
            || strClass === 'fr.sirs.core.model.PenteLit'
            || strClass === 'fr.sirs.core.model.PlageDepotLit'
            || strClass === 'fr.sirs.core.model.RegimeEcoulementLit'
            || strClass === 'fr.sirs.core.model.SeuilLit'
            || strClass === 'fr.sirs.core.model.TronconLit'
            || strClass === 'fr.sirs.core.model.ZoneAtterrissementLit'
            || strClass === 'fr.sirs.core.model.OuvrageAssocieLit'
            ;
    }

    async loadTronconsLit() {
        try {
            const result = await this.EOS.getTronconLit();

            this.tronconsLit = result.map(row => row.doc);
            let favoritesUpdated = false;

            this.tronconsLit.forEach(troncon => {
                const exists = this.appTronconsService.favorites.some(fav => fav.id === troncon._id);
                if (!exists) {
                    this.appTronconsService.favorites.push({
                        id: troncon._id,
                        libelle: troncon.libelle,
                        geometry: troncon.geometry,
                        systemeRepDefautId: troncon.systemeRepDefautId,
                        borneIds: troncon.borneIds
                    });
                    favoritesUpdated = true;
                }

            });

            if (favoritesUpdated) {
                clearMemoize(['isTronconActive']);
                await this.storageService.setItem('AppTronconsFavorities', this.appTronconsService.favorites);
                this.appTronconsService.updated.next('tronçon updated');
            }

        } catch (error) {
            console.error('Error loading troncons:', error);
        }
    }



    onTronconLitChange(selectedTronconLitId: string) {

        // Trouver le tronçon correspondant dans tronconsLit
        const selectedTroncon = this.tronconsLit.find(troncon => troncon._id === selectedTronconLitId);

        if (selectedTroncon) {
            // Mettre à jour les propriétés nécessaires
            this.selectedTronconLitId = selectedTroncon._id; // Ou autre propriété si besoin
            this.EOS.objectDoc.linearId = selectedTroncon._id;
        }
    }
}
