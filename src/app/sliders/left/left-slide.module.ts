import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppinfosLeftSlideComponent } from './appinfos/appinfos.component';
import { AppsettingsLeftSlideComponent } from './appsettings/appsettings.component';
import { LeftSlideAddBackLayerComponent } from './backmap/addbacklayer/addbacklayer.component';
import { LeftSlideBackmapComponent } from './backmap/backmap.component';
import { ColorModalComponent } from './craftlayers/color-modal/color-modal.component';
import { LeftSlideCraftlayersComponent } from './craftlayers/craftlayers.component';
import { LeftSlideDisponibleLayersComponent } from './craftlayers/disponible/disponible.component';
import { LeftSlideComponent } from './left.component';
import { LeftSlideMenuComponent } from './menu/menu.component';
import { ArraySortPipe, LeftSlideTronconComponent } from './troncon/troncon.component';
import { GalleryModule } from './gallery/gallery.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GalleryModule
    ],
    providers: [],
    declarations: [
        LeftSlideComponent,
        LeftSlideMenuComponent,
        AppinfosLeftSlideComponent,
        AppsettingsLeftSlideComponent,
        LeftSlideBackmapComponent,
        LeftSlideAddBackLayerComponent,
        ArraySortPipe,
        LeftSlideTronconComponent,
        LeftSlideCraftlayersComponent,
        ColorModalComponent,
        LeftSlideDisponibleLayersComponent],
    exports: [LeftSlideComponent]
})
export class LeftSlideModule {
}
