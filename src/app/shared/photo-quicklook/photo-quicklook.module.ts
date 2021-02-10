import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoQuicklookComponent } from './photo-quicklook.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
    declarations: [PhotoQuicklookComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        IonicModule,
        MatIconModule,
        MatButtonModule
    ],
    exports: [
        PhotoQuicklookComponent
    ]
})
export class PhotoQuicklookModule {
}
