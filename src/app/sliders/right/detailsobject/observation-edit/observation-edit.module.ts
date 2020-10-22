import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { NgInitDirective, ObservationEditComponent } from './observation-edit.component';
import { ObservationMediaComponent } from './observation-media/observation-media.component';
import { PositionByBorneModal2Component } from './observation-media/positionbyborne-modal2/positionbyborne-modal2.component';
import { EditObjectsModule } from '../../editobjects/editobjects.module';
import { MapPointComponent } from '../../editobjects/map-point/map-point.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule,
    MatButtonModule,
    FlexLayoutModule,
    EditObjectsModule
  ],
  providers: [
  ],
  declarations: [
      ObservationEditComponent, NgInitDirective,
      ObservationMediaComponent, PositionByBorneModal2Component,
  ],
  exports: [ObservationEditComponent]
})
export class ObservationEditModule {}
