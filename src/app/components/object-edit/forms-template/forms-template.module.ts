import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { BaseFormComponent } from './base-form/base-form.component';
import { CoteDigueGenericComponent } from './cote-digue/cote-digue.component';
import { CreteComponent } from './crete/crete.component';
import { DesordreDependanceAhComponent } from './desordre-dependance-ah/desordre-dependance-ah.component';
import { DesordreComponent, RefSortPipe } from './desordre/desordre.component';
import { FonctionHautBasIdGenericComponent } from './fonction-haut-bas-id/fonction-haut-bas-id.component';
import { FonctionIdGenericComponent } from './fonction-id/fonction-id.component';
import { FormsTemplateComponent } from './forms-template.component';
import { LaisseCrueComponent } from './laisse-crue/laisse-crue.component';
import { LargeurFrancBordComponent } from './largeur-franc-bord/largeur-franc-bord.component';
import { MateriauHautBasIdGenericComponent } from './materiau-haut-bas-id/materiau-haut-bas-id.component';
import { MateriauIdGenericComponent } from './materiau-id/materiau-id.component';
import { MonteeEauxComponent } from './montee-eaux/montee-eaux.component';
import { NatureHautBasIdGenericComponent } from './nature-haut-bas-id/nature-haut-bas-id.component';
import { NatureIdGenericComponent } from './nature-id/nature-id.component';
import { OuvertureBatardableComponent } from './ouverture-batardable/ouverture-batardable.component';
import { OuvrageFranchissementComponent } from './ouvrage-franchissement/ouvrage-franchissement.component';
import { OuvrageHydrauliqueComponent } from './ouvrage-hydraulique/ouvrage-hydraulique.component';
import { OuvrageParticulierComponent } from './ouvrage-particulier/ouvrage-particulier.component';
import { OuvrageRevancheComponent } from './ouvrage-revanche/ouvrage-revanche.component';
import { OuvrageTelecomEnergieComponent } from './ouvrage-telecom-energie/ouvrage-telecom-energie.component';
import { OuvrageVoirieComponent } from './ouvrage-voirie/ouvrage-voirie.component';
import { PiedDigueComponent } from './pied-digue/pied-digue.component';
import { PositionDigueGenericComponent } from './position-digue/position-digue.component';
import { ReseauHydrauliqueCielOuvertComponent } from './reseau-hydraulique-ciel-ouvert/reseau-hydraulique-ciel-ouvert.component';
import { ReseauHydrauliqueFermeComponent } from './reseau-hydraulique-ferme/reseau-hydraulique-ferme.component';
import { ReseauTelecomEnergieComponent } from './reseau-telecom-energie/reseau-telecom-energie.component';
import { SommetRisbermeComponent } from './sommet-risberme/sommet-risberme.component';
import { StationPompageComponent } from './station-pompage/station-pompage.component';
import { TalusDigueComponent } from './talus-digue/talus-digue.component';
import { TalusRisbermeComponent } from './talus-risberme/talus-risberme.component';
import { TronconDigueComponent } from './troncon-digue/troncon-digue.component';
import { UsageIdGenericComponent } from './usage-id/usage-id.component';
import { VoieAccesComponent } from './voie-acces/voie-acces.component';
import { VoieDigueComponent } from './voie-digue/voie-digue.component';
import { DocToStringPipeModule } from "../../../pipe/doc-to-string/doc-to-string.pipe.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatCheckboxModule,
        MatButtonModule,
        DocToStringPipeModule,
    ],
  providers: [
  ],
  declarations: [
    FormsTemplateComponent, DesordreComponent, RefSortPipe,
    CreteComponent, LaisseCrueComponent, LargeurFrancBordComponent,
    MonteeEauxComponent, OuvertureBatardableComponent, OuvrageFranchissementComponent,
    OuvrageHydrauliqueComponent, OuvrageParticulierComponent, OuvrageRevancheComponent,
    OuvrageTelecomEnergieComponent, OuvrageVoirieComponent, PiedDigueComponent,
    ReseauHydrauliqueCielOuvertComponent, ReseauHydrauliqueFermeComponent,
    ReseauTelecomEnergieComponent, SommetRisbermeComponent, StationPompageComponent,
    TalusDigueComponent, TalusRisbermeComponent, TronconDigueComponent, VoieAccesComponent,
    VoieDigueComponent, MateriauIdGenericComponent, PositionDigueGenericComponent,
    CoteDigueGenericComponent, UsageIdGenericComponent, NatureIdGenericComponent,
    FonctionIdGenericComponent, FonctionHautBasIdGenericComponent,
    NatureHautBasIdGenericComponent, MateriauHautBasIdGenericComponent,
    BaseFormComponent, DesordreDependanceAhComponent
  ],
  exports: [FormsTemplateComponent]
})
export class FormsTemplateModule {}
