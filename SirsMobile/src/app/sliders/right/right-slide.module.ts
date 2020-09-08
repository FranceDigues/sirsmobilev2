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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  providers: [
  ],
  declarations: [
    RightSlideComponent, RightSlideCreateObjectsComponent,
    RightSlideEditObjectsComponent, LonLatPipe,
    FormsTemplateComponent, DesordreComponent, FilterPipe, RefSortPipe,
    CreteComponent, LaisseCrueComponent, LargeurFrancBordComponent,
    MonteeEauxComponent, OuvertureBatardableComponent, OuvrageFranchissementComponent],
  exports: [RightSlideComponent]
})
export class RightSlideModule {}
