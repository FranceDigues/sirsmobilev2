import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IonicModule } from '@ionic/angular';
import {
    CreateObjectComponent,
    FilterPipe
} from './create-object/create-object.component';
import { RightPanelComponent } from './right-panel.component';
import { SelectedObjectsComponent } from './selected-objects/selected-objects.component';
import { DirectiveModule } from '../../directive.module';
import { ObjectDetailsModule } from '../object-details/object-details.module';
import { DetailsContentModule } from '../object-details/detailscontent/details-content.module';
import { ObservationEditModule } from '../object-details/observation-edit/observation-edit.module';
import { TraitBergeComponent } from './trait-berge/trait-berge.component';
import { FlexLayoutModule } from '@angular/flex-layout';

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
        DirectiveModule,
        FlexLayoutModule
    ],
    providers: [],
    declarations: [
        RightPanelComponent,
        CreateObjectComponent,
        FilterPipe,
        SelectedObjectsComponent,
        TraitBergeComponent
    ],
    exports: [RightPanelComponent]
})
export class RightPanelModule {
}
