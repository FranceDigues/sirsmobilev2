import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import { FilterPipe, RightSlideCreateObjectsComponent } from './createobjects/createobjects.component';
import { RightPanelComponent } from './right-panel.component';
import { SelectedObjectsComponent } from './selectedobjects/selectedobjects.component';
import { DirectiveModule } from '../../directive.module';
import { ObjectDetailsModule } from '../object-details/object-details.module';
import { DetailsContentModule } from '../object-details/detailscontent/details-content.module';
import { ObservationEditModule } from '../object-details/observation-edit/observation-edit.module';

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
        RightPanelComponent,
        RightSlideCreateObjectsComponent,
        FilterPipe,
        SelectedObjectsComponent
    ],
    exports: [RightPanelComponent]
})
export class RightPanelModule {
}
