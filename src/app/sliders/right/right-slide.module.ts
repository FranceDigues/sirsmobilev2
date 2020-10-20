import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { FilterPipe, RightSlideCreateObjectsComponent } from './createobjects/createobjects.component';
import { DetailsContentModule } from './detailsobject/detailscontent/details-content.module';
import { DetailsObjectComponent } from './detailsobject/detailsobject.component';
import { ObservationEditComponent } from './detailsobject/observation-edit/observation-edit.component';
import { LonLatPipe } from './editobjects/editobjects.component';
import { PositionByBorneModalComponent } from './editobjects/positionbyborne-modal/positionbyborne-modal.component';
import { RightSlideComponent } from './right.component';
import { SelectedObjectsComponent } from './selectedobjects/selectedobjects.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule,
    MatButtonModule,
    DetailsContentModule
  ],
  providers: [
  ],
  declarations: [
    RightSlideComponent, RightSlideCreateObjectsComponent,
    LonLatPipe, FilterPipe, DetailsObjectComponent, SelectedObjectsComponent,
    PositionByBorneModalComponent, ObservationEditComponent
  ],
  exports: [RightSlideComponent]
})
export class RightSlideModule {}
