import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LonLatPipe, RightSlideEditObjectsComponent } from './editobjects.component';
import { FormsTemplateModule } from './forms-template/forms-template.module';
import { MapLineComponent } from './map-line/map-line.component';
import { MapPointComponent } from './map-point/map-point.component';
import { MapPolygonComponent } from './map-polygon/map-polygon.component';
import { PositionByBorneModalComponent } from './positionbyborne-modal/positionbyborne-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormsTemplateModule
  ],
  providers: [
  ],
  declarations: [
    MapLineComponent, MapPointComponent,
    MapPolygonComponent, PositionByBorneModalComponent,
    LonLatPipe
  ],
  exports: [RightSlideEditObjectsComponent]
})
export class EditObjectsModule {}
