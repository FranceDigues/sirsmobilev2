import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubTitleVegetationPipe } from "./sub-title-vegetation.pipe";


@NgModule({
    declarations: [SubTitleVegetationPipe],
    exports: [
        SubTitleVegetationPipe
    ],
    imports: [
        CommonModule
    ]
})
export class SubTitleVegetationPipeModule {
}
