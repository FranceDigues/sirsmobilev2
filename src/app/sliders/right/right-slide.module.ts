import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { FilterPipe, RightSlideCreateObjectsComponent } from './createobjects/createobjects.component';
import { DetailsContentModule } from './detailsobject/detailscontent/details-content.module';
import { DetailsObjectComponent } from './detailsobject/detailsobject.component';
import { RightSlideComponent } from './right.component';
import { SelectedObjectsComponent } from './selectedobjects/selectedobjects.component';
import { ObservationEditModule } from './detailsobject/observation-edit/observation-edit.module';
import { EditObjectsModule } from './editobjects/editobjects.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule,
    MatButtonModule,
    DetailsContentModule,
    ObservationEditModule,
    EditObjectsModule
  ],
  providers: [
  ],
  declarations: [
    RightSlideComponent, RightSlideCreateObjectsComponent,
    FilterPipe, DetailsObjectComponent, SelectedObjectsComponent,
  ],
  exports: [RightSlideComponent]
})
export class RightSlideModule {}
