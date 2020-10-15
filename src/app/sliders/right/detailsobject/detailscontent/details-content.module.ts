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
    DesordresGenericComponent, ObservationsGenericComponent, PrestationsGenericComponent,
    DetailsContentComponent, AutreDependanceComponent, AireStockageDependanceComponent,
    BorneDigueComponent, CheminAccesDependanceComponent, CreteComponent,
    DesordreComponent, DesordreDependanceComponent, EchelleLimnimetriqueComponent,
    LaisseCrueComponent, LargeurFrancBordComponent, MonteeEauxComponent, OuvertureBatardableComponent,
    OuvrageFranchissementComponent, OuvrageHydrauliqueAssocieComponent, OuvrageHydroAssocieComponent,
    OuvrageParticulierComponent, OuvrageRevancheComponent
  ],
  exports: [DetailsContentComponent]
})
export class DetailsContentModule {}
