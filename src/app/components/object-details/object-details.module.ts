import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectDetailsComponent } from './object-details.component';
import { FormsModule } from '@angular/forms';
import { DetailsContentModule } from './detailscontent/details-content.module';
import { ObservationDetailsModule } from './observation-details/observation-details.module';
import { PhotoDetailsModule } from './photo-details/photo-details.module';
import { MatButtonModule } from '@angular/material/button';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
    declarations: [ObjectDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DetailsContentModule,
        ObservationDetailsModule,
        PhotoDetailsModule,
        MatButtonModule,
        MatIconModule
    ],
    exports: [ObjectDetailsComponent]
})
export class ObjectDetailsModule {
}
