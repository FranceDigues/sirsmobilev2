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
import { LonLatPipe, RightSlideEditObjectsComponent } from './editobjects/editobjects.component';
import { FormsTemplateModule } from './editobjects/forms-template/forms-template.module';
import { MapLineComponent } from './editobjects/map-line/map-line.component';
import { MapPointComponent } from './editobjects/map-point/map-point.component';
import { MapPolygonComponent } from './editobjects/map-polygon/map-polygon.component';
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
    FormsTemplateModule,
    DetailsContentModule
  ],
  providers: [
  ],
  declarations: [
    RightSlideComponent, RightSlideCreateObjectsComponent,
    RightSlideEditObjectsComponent, LonLatPipe,
    MapLineComponent, MapPointComponent, MapPolygonComponent,
    FilterPipe, DetailsObjectComponent, SelectedObjectsComponent,
    PositionByBorneModalComponent, ObservationEditComponent
  ],
  exports: [RightSlideComponent]
})
export class RightSlideModule {}
