import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationDetailsComponent } from './observation-details.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [ObservationDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    exports: [ObservationDetailsComponent]
})
export class ObservationDetailsModule {
}
