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
import { GalleryDocumentComponent } from './gallery/document/document.component';
import { GalleryMediasComponent } from './gallery/medias/medias.component';
import { LeftSlideComponent } from './left.component';
import { LeftSlideMenuComponent } from './menu/menu.component';
import { ArraySortPipe, LeftSlideTronconComponent } from './troncon/troncon.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  providers: [
  ],
  declarations: [LeftSlideComponent, LeftSlideMenuComponent,
    AppinfosLeftSlideComponent, AppsettingsLeftSlideComponent,
    GalleryDocumentComponent, GalleryMediasComponent,
    LeftSlideBackmapComponent, LeftSlideAddBackLayerComponent,
    ArraySortPipe, LeftSlideTronconComponent, LeftSlideCraftlayersComponent, ColorModalComponent,
    LeftSlideDisponibleLayersComponent],
  exports: [LeftSlideComponent]
})
export class LeftSlideModule {}
