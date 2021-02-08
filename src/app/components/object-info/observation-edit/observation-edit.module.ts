import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { ArraySortPipe2, NgInitDirective, ObservationEditComponent } from './observation-edit.component';
import { ObservationMediaComponent } from './observation-media/observation-media.component';
import { PositionByBorneModal2Component } from './observation-media/positionbyborne-modal2/positionbyborne-modal2.component';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { DirectiveModule } from '../../../directive.module';
import { EditNoteModule } from './observation-media/edit-note/edit-note.module';
import { ObjectEditModule } from '../../object-edit/object-edit.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatCheckboxModule,
        MatButtonModule,
        FlexLayoutModule,
        ObjectEditModule,
        DirectiveModule,
        EditNoteModule
    ],
    providers: [
        Base64ToGallery
    ],
    declarations: [
        ObservationEditComponent,
        ObservationEditComponent, NgInitDirective,
        ObservationMediaComponent, PositionByBorneModal2Component,
        ArraySortPipe2
    ],
    exports: [ObservationEditComponent]
})
export class ObservationEditModule {
}
