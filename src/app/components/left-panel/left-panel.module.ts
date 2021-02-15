import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppInfosComponent } from './app-infos/app-infos.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { LeftSlideAddBackLayerComponent } from './backmap/addbacklayer/addbacklayer.component';
import { LeftSlideBackmapComponent } from './backmap/backmap.component';
import { ColorModalComponent } from './app-layers/color-modal/color-modal.component';
import { AppLayersComponent } from './app-layers/app-layers.component';
import { LeftSlideDisponibleLayersComponent } from './app-layers/disponible/disponible.component';
import { LeftPanelComponent } from './left-panel.component';
import { MenuPanelComponent } from './menu-panel/menu-panel.component';
import { ArraySortPipe, LeftSlideTronconComponent } from './troncon/troncon.component';
import { GalleryModule } from './gallery/gallery.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GalleryModule,
        FlexLayoutModule,
        MatIconModule
    ],
    providers: [],
    declarations: [
        LeftPanelComponent,
        MenuPanelComponent,
        AppInfosComponent,
        AppSettingsComponent,
        LeftSlideBackmapComponent,
        LeftSlideAddBackLayerComponent,
        ArraySortPipe,
        LeftSlideTronconComponent,
        AppLayersComponent,
        ColorModalComponent,
        LeftSlideDisponibleLayersComponent],
    exports: [LeftPanelComponent]
})
export class LeftPanelModule {
}
