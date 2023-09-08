import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatOptionTextPipe } from "./format-option-text.pipe";


@NgModule({
    declarations: [FormatOptionTextPipe],
    exports: [
        FormatOptionTextPipe
    ],
    imports: [
        CommonModule
    ]
})
export class FormatOptionTextPipeModule {
}
