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
import { ObjectInfoModule } from '../../components/object-info/object-info.module';
import { DetailsContentModule } from '../../components/object-info/detailscontent/details-content.module';
import { ObservationEditModule } from '../../components/object-info/observation-edit/observation-edit.module';
import { ObservationDetailsComponent } from '../../components/object-info/observation-details/observation-details.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatCheckboxModule,
        MatButtonModule,
        DetailsContentModule,
        ObservationEditModule,
        ObjectInfoModule,
        DirectiveModule
    ],
    providers: [],
    declarations: [
        RightSlideComponent,
        RightSlideCreateObjectsComponent,
        FilterPipe,
        SelectedObjectsComponent,
        ObservationDetailsComponent
    ],
    exports: [RightSlideComponent]
})
export class RightSlideModule {
}
