import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppInfosComponent } from './app-infos/app-infos.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { LeftSlideAddBackLayerComponent } from './backmap/addbacklayer/addbacklayer.component';
import { LeftSlideEditBackLayerComponent } from './backmap/edit-back-layer/edit-back-layer.component';
import { LeftSlideBackmapComponent } from './backmap/backmap.component';
import { ColorModalComponent } from './app-layers/color-modal/color-modal.component';
import { AppLayersComponent } from './app-layers/app-layers.component';
import { LeftSlideDisponibleLayersComponent } from './app-layers/disponible/disponible.component';
import { LeftPanelComponent } from './left-panel.component';
import { MenuPanelComponent } from './menu-panel/menu-panel.component';
import { ArraySortPipe, LeftSlideTronconComponent } from './troncon/troncon.component';
import { ShapesLayersManagerComponent } from './shapes-layers-manager/shapes-layers-manager.component';
import { AddShapesLayersComponent } from './shapes-layers-manager/add-shapes-layers/add-shapes-layers.component';
import { GalleryModule } from './gallery/gallery.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { ObservationEditModule } from "../object-details/observation-edit/observation-edit.module";
import { AppSettings2Component } from "./app-settings2/app-settings2.component";
import { GpsSettingsComponent } from "./gps-settings/gps-settings.component";
import { PhotoSettingsComponent } from "./photo-settings/photo-settings.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GalleryModule,
        FlexLayoutModule,
        MatIconModule,
        ObservationEditModule
    ],
    providers: [],
    declarations: [
        LeftPanelComponent,
        MenuPanelComponent,
        AppInfosComponent,
        AppSettingsComponent,
        AppSettings2Component,
        GpsSettingsComponent,
        PhotoSettingsComponent,
        ShapesLayersManagerComponent,
        AddShapesLayersComponent,
        LeftSlideBackmapComponent,
        LeftSlideAddBackLayerComponent,
        LeftSlideEditBackLayerComponent,
        ArraySortPipe,
        LeftSlideTronconComponent,
        AppLayersComponent,
        ColorModalComponent,
        LeftSlideDisponibleLayersComponent],
    exports: [LeftPanelComponent]
})
export class LeftPanelModule {
}
