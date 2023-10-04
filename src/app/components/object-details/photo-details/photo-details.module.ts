import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoDetailsComponent } from './photo-details.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [PhotoDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    exports: [PhotoDetailsComponent]
})
export class PhotoDetailsModule {
}
