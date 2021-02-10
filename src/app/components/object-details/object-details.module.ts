import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectDetailsComponent } from './object-details.component';
import { FormsModule } from '@angular/forms';
import { DetailsContentModule } from './detailscontent/details-content.module';
import { ObservationDetailsModule } from './observation-details/observation-details.module';


@NgModule({
    declarations: [ObjectDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        DetailsContentModule,
        ObservationDetailsModule
    ],
    exports: [ObjectDetailsComponent]
})
export class ObjectDetailsModule {
}
