import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { FilterPipe, RightSlideCreateObjectsComponent } from './createobjects/createobjects.component';
import { LonLatPipe, RightSlideEditObjectsComponent } from './createobjects/editobjects/editobjects.component';
import { DesordreComponent, RefSortPipe } from './createobjects/editobjects/forms-template/desordre/desordre.component';
import { FormsTemplateComponent } from './createobjects/editobjects/forms-template/forms-template.component';
import { RightSlideComponent } from './right.component';
import { CreteComponent } from './createobjects/editobjects/forms-template/crete/crete.component';
import { LaisseCrueComponent } from './createobjects/editobjects/forms-template/laisse-crue/laisse-crue.component';
import { LargeurFrancBordComponent } from './createobjects/editobjects/forms-template/largeur-franc-bord/largeur-franc-bord.component';
import { MonteeEauxComponent } from './createobjects/editobjects/forms-template/montee-eaux/montee-eaux.component';
import { OuvertureBatardableComponent } from './createobjects/editobjects/forms-template/ouverture-batardable/ouverture-batardable.component';
import { OuvrageFranchissementComponent } from './createobjects/editobjects/forms-template/ouvrage-franchissement/ouvrage-franchissement.component';
import { OuvrageHydrauliqueComponent } from './createobjects/editobjects/forms-template/ouvrage-hydraulique/ouvrage-hydraulique.component';
import { OuvrageParticulierComponent } from './createobjects/editobjects/forms-template/ouvrage-particulier/ouvrage-particulier.component';
import { OuvrageRevancheComponent } from './createobjects/editobjects/forms-template/ouvrage-revanche/ouvrage-revanche.component';
import { OuvrageTelecomEnergieComponent } from './createobjects/editobjects/forms-template/ouvrage-telecom-energie/ouvrage-telecom-energie.component';
import { OuvrageVoirieComponent } from './createobjects/editobjects/forms-template/ouvrage-voirie/ouvrage-voirie.component';
import { PiedDigueComponent } from './createobjects/editobjects/forms-template/pied-digue/pied-digue.component';
import { ReseauHydrauliqueCielOuvertComponent } from './createobjects/editobjects/forms-template/reseau-hydraulique-ciel-ouvert/reseau-hydraulique-ciel-ouvert.component';
import { ReseauHydrauliqueFermeComponent } from './createobjects/editobjects/forms-template/reseau-hydraulique-ferme/reseau-hydraulique-ferme.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ReseauTelecomEnergieComponent } from './createobjects/editobjects/forms-template/reseau-telecom-energie/reseau-telecom-energie.component';
import { SommetRisbermeComponent } from './createobjects/editobjects/forms-template/sommet-risberme/sommet-risberme.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule
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
    ReseauTelecomEnergieComponent, SommetRisbermeComponent],
  exports: [RightSlideComponent]
})
export class RightSlideModule {}
