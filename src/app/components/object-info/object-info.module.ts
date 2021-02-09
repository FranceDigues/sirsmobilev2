import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectInfoComponent } from './object-info.component';
import { FormsModule } from '@angular/forms';
import { DetailsContentModule } from './detailscontent/details-content.module';


@NgModule({
    declarations: [ObjectInfoComponent],
    imports: [
        CommonModule,
        FormsModule,
        DetailsContentModule
    ],
    exports: [ObjectInfoComponent]
})
export class ObjectInfoModule {
}
