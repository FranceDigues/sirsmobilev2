import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationDetailsComponent } from './observation-details.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ObservationEditModule } from '../observation-edit/observation-edit.module';

@NgModule({
    declarations: [ObservationDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ObservationEditModule
    ],
    exports: [ObservationDetailsComponent]
})
export class ObservationDetailsModule {
}
