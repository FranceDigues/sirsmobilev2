import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GalleryComponent } from './gallery.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        FlexLayoutModule
    ],
    providers: [],
    declarations: [
        GalleryComponent
    ],
    exports: [GalleryComponent]
})
export class GalleryModule {
}
