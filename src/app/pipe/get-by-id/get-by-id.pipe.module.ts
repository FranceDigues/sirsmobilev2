import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetByIdPipe } from "./get-by-id.pipe";


@NgModule({
    declarations: [GetByIdPipe],
    exports: [
        GetByIdPipe
    ],
    imports: [
        CommonModule
    ]
})
export class GetByIdPipeModule {
}
