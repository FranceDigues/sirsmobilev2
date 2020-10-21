import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { NgInitDirective, ObservationEditComponent } from './observation-edit.component';
import { ObservationMediaComponent } from './observation-media/observation-media.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule,
    MatButtonModule,
    FlexLayoutModule,
  ],
  providers: [
  ],
  declarations: [
      ObservationEditComponent, NgInitDirective,
      ObservationMediaComponent
  ],
  exports: [ObservationEditComponent]
})
export class ObservationEditModule {}
