import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { CreteComponent } from './crete/crete.component';
import { DesordreComponent, RefSortPipe } from './desordre/desordre.component';
import { FormsTemplateComponent } from './forms-template.component';
import { LaisseCrueComponent } from './laisse-crue/laisse-crue.component';
import { LargeurFrancBordComponent } from './largeur-franc-bord/largeur-franc-bord.component';
import { MateriauIdGenericComponent } from './materiau-id/materiau-id.component';
import { MonteeEauxComponent } from './montee-eaux/montee-eaux.component';
import { OuvertureBatardableComponent } from './ouverture-batardable/ouverture-batardable.component';
import { OuvrageFranchissementComponent } from './ouvrage-franchissement/ouvrage-franchissement.component';
import { OuvrageHydrauliqueComponent } from './ouvrage-hydraulique/ouvrage-hydraulique.component';
import { OuvrageParticulierComponent } from './ouvrage-particulier/ouvrage-particulier.component';
import { OuvrageRevancheComponent } from './ouvrage-revanche/ouvrage-revanche.component';
import { OuvrageTelecomEnergieComponent } from './ouvrage-telecom-energie/ouvrage-telecom-energie.component';
import { OuvrageVoirieComponent } from './ouvrage-voirie/ouvrage-voirie.component';
import { PiedDigueComponent } from './pied-digue/pied-digue.component';
import { ReseauHydrauliqueCielOuvertComponent } from './reseau-hydraulique-ciel-ouvert/reseau-hydraulique-ciel-ouvert.component';
import { ReseauHydrauliqueFermeComponent } from './reseau-hydraulique-ferme/reseau-hydraulique-ferme.component';
import { ReseauTelecomEnergieComponent } from './reseau-telecom-energie/reseau-telecom-energie.component';
import { SommetRisbermeComponent } from './sommet-risberme/sommet-risberme.component';
import { StationPompageComponent } from './station-pompage/station-pompage.component';
import { TalusDigueComponent } from './talus-digue/talus-digue.component';
import { TalusRisbermeComponent } from './talus-risberme/talus-risberme.component';
import { TronconDigueComponent } from './troncon-digue/troncon-digue.component';
import { VoieAccesComponent } from './voie-acces/voie-acces.component';
import { VoieDigueComponent } from './voie-digue/voie-digue.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule,
    MatButtonModule,
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
    VoieDigueComponent, MateriauIdGenericComponent
  ],
  exports: [FormsTemplateComponent]
})
export class FormsTemplateModule {}
