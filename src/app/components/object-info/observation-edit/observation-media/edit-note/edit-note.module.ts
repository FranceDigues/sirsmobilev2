import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditNoteComponent } from './edit-note.component';
import { FormsModule } from "@angular/forms";

@NgModule({
    declarations: [EditNoteComponent],
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [EditNoteComponent]
})
export class EditNoteModule {
}
