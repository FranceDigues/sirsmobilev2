import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { AireStockageDependanceComponent } from './aire-stockage-dependance/aire-stockage-dependance.component';
import { AutreDependanceComponent } from './autre-dependance/autre-dependance.component';
import { BorneDigueComponent } from './borne-digue/borne-digue.component';
import { CheminAccesDependanceComponent } from './chemin-acces-dependance/chemin-acces-dependance.component';
import { CreteComponent } from './crete/crete.component';
import { DesordreDependanceComponent } from './desordre-dependance/desordre-dependance.component';
import { DesordreComponent } from './desordre/desordre.component';
import { DetailsContentComponent } from './detailscontent.component';
import { EchelleLimnimetriqueComponent } from './echelle-limnimetrique/echelle-limnimetrique.component';
import { DesordresGenericComponent } from './desordres/desordres.component';
import { ObservationsGenericComponent } from './observations/observations.component';
import { PrestationsGenericComponent } from './prestations/prestations.component';
import { LaisseCrueComponent } from './laisse-crue/laisse-crue.component';
import { LargeurFrancBordComponent } from './largeur-franc-bord/largeur-franc-bord.component';
import { MonteeEauxComponent } from './montee-eaux/montee-eaux.component';
import { OuvertureBatardableComponent } from './ouverture-batardable/ouverture-batardable.component';
import { OuvrageFranchissementComponent } from './ouvrage-franchissement/ouvrage-franchissement.component';
import { OuvrageHydrauliqueAssocieComponent } from './ouvrage-hydraulique-associe/ouvrage-hydraulique-associe.component';
import { OuvrageHydroAssocieComponent } from './ouvrage-hydro-associe/ouvrage-hydro-associe.component';
import { OuvrageParticulierComponent } from './ouvrage-particulier/ouvrage-particulier.component';
import { OuvrageRevancheComponent } from './ouvrage-revanche/ouvrage-revanche.component';
import { OuvrageTelecomEnergieComponent } from './ouvrage-telecom-energie/ouvrage-telecom-energie.component';
import { OuvrageVoirieComponent } from './ouvrage-voirie/ouvrage-voirie.component';
import { OuvrageVoirieDependanceComponent } from './ouvrage-voirie-dependance/ouvrage-voirie-dependance.component';
import { PiedDigueComponent } from './pied-digue/pied-digue.component';
import { PrestationComponent } from './prestation/prestation.component';
import { ReseauHydrauliqueCielOuvertComponent } from './reseau-hydraulique-ciel-ouvert/reseau-hydraulique-ciel-ouvert.component';
import { ReseauHydrauliqueFermeComponent } from './reseau-hydraulique-ferme/reseau-hydraulique-ferme.component';
import { ReseauTelecomEnergieComponent } from './reseau-telecom-energie/reseau-telecom-energie.component';
import { SommetRisberneComponent } from './sommet-risberne/sommet-risberne.component';
import { StationPompageComponent } from './station-pompage/station-pompage.component';
import { TalusDigueComponent } from './talus-digue/talus-digue.component';
import { TalusRisbermeComponent } from './talus-risberme/talus-risberme.component';
import { TronconDigueComponent } from './troncon-digue/troncon-digue.component';
import { VoieAccesComponent } from './voie-acces/voie-acces.component';
import { VoieDigueComponent } from './voie-digue/voie-digue.component';
import { AmenagementHydrauliqueComponent } from './amenagement-hydraulique/amenagement-hydraulique.component';
import { OrganeProtectionCollectiveComponent } from './organe-protection-collective/organe-protection-collective.component';
import { OuvrageAssocieAmenagementHydrauliqueComponent } from './ouvrage-associe-amenagement-hydraulique/ouvrage-associe-amenagement-hydraulique.component';
import { PrestationAmenagementHydrauliqueComponent } from './prestation-amenagement-hydraulique/prestation-amenagement-hydraulique.component';
import { StructureAmenagementHydrauliqueComponent } from './structure-amenagement-hydraulique/structure-amenagement-hydraulique.component';
import { TraitAmenagementHydrauliqueComponent } from './trait-amenagement-hydraulique/trait-amenagement-hydraulique.component';
import {MatIconModule} from "@angular/material/icon";
import { ObservationItemComponent } from "./observations/observation-item/observation-item.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { VegetationDetailsComponent } from "./vegetation-details/vegetation-details.component";
import {
    ParcelleVegetationDetailsComponent
} from "./parcelle-vegetation-details/parcelle-vegetation-details.component";
import { FormatOptionTextPipeModule } from "../../../pipe/format-option-text/format-option-text.pipe.module";
import { GetByIdPipeModule } from "../../../pipe/get-by-id/get-by-id.pipe.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FormatOptionTextPipeModule,
        GetByIdPipeModule
    ],
  providers: [
  ],
  declarations: [
    DesordresGenericComponent, ObservationsGenericComponent, PrestationsGenericComponent,
    DetailsContentComponent, AutreDependanceComponent, AireStockageDependanceComponent,
    BorneDigueComponent, CheminAccesDependanceComponent, CreteComponent,
    DesordreComponent, DesordreDependanceComponent, EchelleLimnimetriqueComponent,
    LaisseCrueComponent, LargeurFrancBordComponent, MonteeEauxComponent, OuvertureBatardableComponent,
    OuvrageFranchissementComponent, OuvrageHydrauliqueAssocieComponent, OuvrageHydroAssocieComponent,
    OuvrageParticulierComponent, OuvrageRevancheComponent, OuvrageTelecomEnergieComponent,
    OuvrageVoirieComponent, OuvrageVoirieDependanceComponent, PiedDigueComponent,
    PrestationComponent, ReseauHydrauliqueCielOuvertComponent, ReseauHydrauliqueFermeComponent,
    ReseauTelecomEnergieComponent, SommetRisberneComponent, StationPompageComponent,
    TalusDigueComponent, TalusRisbermeComponent, TronconDigueComponent, VoieAccesComponent,
    VoieDigueComponent, AmenagementHydrauliqueComponent, OrganeProtectionCollectiveComponent,
    OuvrageAssocieAmenagementHydrauliqueComponent, PrestationAmenagementHydrauliqueComponent,
    StructureAmenagementHydrauliqueComponent, TraitAmenagementHydrauliqueComponent, ObservationItemComponent,
      VegetationDetailsComponent, ParcelleVegetationDetailsComponent
  ],
  exports: [DetailsContentComponent]
})
export class DetailsContentModule {}
