import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ObjectEditComponent } from './object-edit.component';
import { FormsTemplateModule } from './forms-template/forms-template.module';
import { MapLineComponent } from './map-line/map-line.component';
import { MapPointComponent } from './map-point/map-point.component';
import { MapPolygonComponent } from './map-polygon/map-polygon.component';
import { PositionByBorneModalComponent } from './positionbyborne-modal/positionbyborne-modal.component';
import { MediaDetailsComponent } from './media-details/media-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MediaFormComponent } from './media-form/media-form.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EditNoteModule } from '../object-details/observation-edit/observation-media/edit-note/edit-note.module';
import { PhotoQuicklookModule } from '../../shared/photo-quicklook/photo-quicklook.module';
import { MatButtonModule } from '@angular/material/button';
import { PhotoEditComponent } from './photo-edit/photo-edit.component';
import { PositionbyborneModalPhotoComponent } from './photo-edit/positionbyborne-modal-photo/positionbyborne-modal-photo.component';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { DocToStringPipeModule } from "../../pipe/doc-to-string/doc-to-string.pipe.module";
import { VegetationFormComponent } from "./components/vegetation-form/vegetation-form.component";
import { FormatOptionTextPipeModule } from "../../pipe/format-option-text/format-option-text.pipe.module";
import { DependenceFormComponent } from "./components/dependence-form/dependence-form.component";
import { DefaultFormComponent } from "./components/default-form/default-form.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        FormsTemplateModule,
        MatIconModule,
        FlexLayoutModule,
        EditNoteModule,
        PhotoQuicklookModule,
        MatButtonModule,
        MatCheckboxModule,
        DocToStringPipeModule,
        FormatOptionTextPipeModule
    ],
    providers: [],
    declarations: [
        ObjectEditComponent,
        MapLineComponent, MapPointComponent,
        MapPolygonComponent, PositionByBorneModalComponent,
        MediaDetailsComponent,
        MediaFormComponent, PhotoEditComponent, PositionbyborneModalPhotoComponent,
        VegetationFormComponent, DependenceFormComponent, DefaultFormComponent
    ],
    exports: [ObjectEditComponent, MapPointComponent]
})
export class ObjectEditModule {
}
