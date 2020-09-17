import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { FilterPipe, RightSlideCreateObjectsComponent } from './createobjects/createobjects.component';
import { LonLatPipe, RightSlideEditObjectsComponent } from './editobjects/editobjects.component';
import { DesordreComponent, RefSortPipe } from './editobjects/forms-template/desordre/desordre.component';
import { FormsTemplateComponent } from './editobjects/forms-template/forms-template.component';
import { RightSlideComponent } from './right.component';
import { CreteComponent } from './editobjects/forms-template/crete/crete.component';
import { LaisseCrueComponent } from './editobjects/forms-template/laisse-crue/laisse-crue.component';
import { LargeurFrancBordComponent } from './editobjects/forms-template/largeur-franc-bord/largeur-franc-bord.component';
import { MonteeEauxComponent } from './editobjects/forms-template/montee-eaux/montee-eaux.component';
import { OuvertureBatardableComponent } from './editobjects/forms-template/ouverture-batardable/ouverture-batardable.component';
import { OuvrageFranchissementComponent } from './editobjects/forms-template/ouvrage-franchissement/ouvrage-franchissement.component';
import { OuvrageHydrauliqueComponent } from './editobjects/forms-template/ouvrage-hydraulique/ouvrage-hydraulique.component';
import { OuvrageParticulierComponent } from './editobjects/forms-template/ouvrage-particulier/ouvrage-particulier.component';
import { OuvrageRevancheComponent } from './editobjects/forms-template/ouvrage-revanche/ouvrage-revanche.component';
import { OuvrageTelecomEnergieComponent } from './editobjects/forms-template/ouvrage-telecom-energie/ouvrage-telecom-energie.component';
import { OuvrageVoirieComponent } from './editobjects/forms-template/ouvrage-voirie/ouvrage-voirie.component';
import { PiedDigueComponent } from './editobjects/forms-template/pied-digue/pied-digue.component';
import { ReseauHydrauliqueCielOuvertComponent } from './editobjects/forms-template/reseau-hydraulique-ciel-ouvert/reseau-hydraulique-ciel-ouvert.component';
import { ReseauHydrauliqueFermeComponent } from './editobjects/forms-template/reseau-hydraulique-ferme/reseau-hydraulique-ferme.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ReseauTelecomEnergieComponent } from './editobjects/forms-template/reseau-telecom-energie/reseau-telecom-energie.component';
import { SommetRisbermeComponent } from './editobjects/forms-template/sommet-risberme/sommet-risberme.component';
import { StationPompageComponent } from './editobjects/forms-template/station-pompage/station-pompage.component';
import { TalusDigueComponent } from './editobjects/forms-template/talus-digue/talus-digue.component';
import { TalusRisbermeComponent } from './editobjects/forms-template/talus-risberme/talus-risberme.component';
import { TronconDigueComponent } from './editobjects/forms-template/troncon-digue/troncon-digue.component';
import { VoieAccesComponent } from './editobjects/forms-template/voie-acces/voie-acces.component';
import { VoieDigueComponent } from './editobjects/forms-template/voie-digue/voie-digue.component';
import { MapLineComponent } from './editobjects/map-line/map-line.component';
import { MapPointComponent } from './editobjects/map-point/map-point.component';
import { MapPolygonComponent } from './editobjects/map-polygon/map-polygon.component';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  providers: [
  ],
  declarations: [
    RightSlideComponent, RightSlideCreateObjectsComponent,
    RightSlideEditObjectsComponent, LonLatPipe,
    FormsTemplateComponent, DesordreComponent, FilterPipe, RefSortPipe,
    CreteComponent, LaisseCrueComponent, LargeurFrancBordComponent,
    MonteeEauxComponent, OuvertureBatardableComponent, OuvrageFranchissementComponent,
    OuvrageHydrauliqueComponent, OuvrageParticulierComponent, OuvrageRevancheComponent,
    OuvrageTelecomEnergieComponent, OuvrageVoirieComponent, PiedDigueComponent,
    ReseauHydrauliqueCielOuvertComponent, ReseauHydrauliqueFermeComponent,
    ReseauTelecomEnergieComponent, SommetRisbermeComponent, StationPompageComponent,
    TalusDigueComponent, TalusRisbermeComponent, TronconDigueComponent, VoieAccesComponent,
    VoieDigueComponent, MapLineComponent, MapPointComponent, MapPolygonComponent],
  exports: [RightSlideComponent]
})
export class RightSlideModule {}
