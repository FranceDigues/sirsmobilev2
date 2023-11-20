import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditNoteComponent } from './edit-note.component';
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

@NgModule({
    declarations: [EditNoteComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
    ],
    exports: [EditNoteComponent]
})
export class EditNoteModule {
}
