import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocToStringPipe } from "./doc-to-string.pipe";


@NgModule({
    declarations: [DocToStringPipe],
    exports: [
        DocToStringPipe
    ],
    imports: [
        CommonModule
    ]
})
export class DocToStringPipeModule {
}
