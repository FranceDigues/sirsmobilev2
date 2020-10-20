import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeftSlideSynchronisationComponent } from './synchronisation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  providers: [],
  declarations: [],
  exports: [LeftSlideSynchronisationComponent]
})
export class SynchronisationModule {}
