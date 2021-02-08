import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectInfoComponent } from './object-info.component';


@NgModule({
    declarations: [ObjectInfoComponent],
    imports: [
        CommonModule
    ],
    exports: [ObjectInfoComponent]
})
export class ObjectInfoModule {
}
