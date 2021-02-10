import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { FilterPipe, RightSlideCreateObjectsComponent } from './createobjects/createobjects.component';
import { RightSlideComponent } from './right.component';
import { SelectedObjectsComponent } from './selectedobjects/selectedobjects.component';
import { DirectiveModule } from '../../directive.module';
import { ObjectDetailsModule } from '../../components/object-details/object-details.module';
import { DetailsContentModule } from '../../components/object-details/detailscontent/details-content.module';
import { ObservationEditModule } from '../../components/object-details/observation-edit/observation-edit.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatCheckboxModule,
        MatButtonModule,
        DetailsContentModule,
        ObservationEditModule,
        ObjectDetailsModule,
        DirectiveModule
    ],
    providers: [],
    declarations: [
        RightSlideComponent,
        RightSlideCreateObjectsComponent,
        FilterPipe,
        SelectedObjectsComponent
    ],
    exports: [RightSlideComponent]
})
export class RightSlideModule {
}
