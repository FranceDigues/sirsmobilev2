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
import { MediaDetailsComponent } from './media-details/media-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MediaFormComponent } from './media-form/media-form.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EditNoteModule } from '../detailsobject/observation-edit/observation-media/edit-note/edit-note.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        FormsTemplateModule,
        MatIconModule,
        FlexLayoutModule,
        EditNoteModule
    ],
    providers: [],
    declarations: [
        RightSlideEditObjectsComponent,
        MapLineComponent, MapPointComponent,
        MapPolygonComponent, PositionByBorneModalComponent,
        LonLatPipe,
        MediaDetailsComponent,
        MediaFormComponent
    ],
    exports: [RightSlideEditObjectsComponent, MapPointComponent]
})
export class EditObjectsModule {
}
