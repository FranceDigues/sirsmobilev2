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
import { DirectiveModule } from '../../directives/directive.module';
import { ObjectDetailsModule } from '../object-details/object-details.module';
import { DetailsContentModule } from '../object-details/detailscontent/details-content.module';
import { ObservationEditModule } from '../object-details/observation-edit/observation-edit.module';
import { TraitComponent } from './trait/trait.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DocToStringPipeModule } from "../../pipe/doc-to-string/doc-to-string.pipe.module";
import { SubTitleVegetationPipeModule } from "../../pipe/sub-title-vegetation/sub-title-vegetation.pipe.module";

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
        FlexLayoutModule,
        DocToStringPipeModule,
        SubTitleVegetationPipeModule
    ],
    providers: [],
    declarations: [
        RightPanelComponent,
        CreateObjectComponent,
        FilterPipe,
        SelectedObjectsComponent,
        TraitComponent
    ],
    exports: [RightPanelComponent]
})
export class RightPanelModule {
}
