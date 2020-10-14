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
import { DesordreComponent } from './desordre/desordre.component';
import { DetailsContentComponent } from './detailscontent.component';


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
    DetailsContentComponent, AutreDependanceComponent, AireStockageDependanceComponent,
    BorneDigueComponent, CheminAccesDependanceComponent, CreteComponent,
    DesordreComponent
  ],
  exports: [DetailsContentComponent]
})
export class DetailsContentModule {}
