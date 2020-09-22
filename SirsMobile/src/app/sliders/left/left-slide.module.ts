import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LeftSlideComponent } from './left.component';
import { LeftSlideMenuComponent } from './menu/menu.component';
import { AppsettingsLeftSlideComponent } from './appsettings/appsettings.component';
import { LeftSlideSynchronisationComponent } from './synchronisation/synchronisation.component';
import { GalleryMediasComponent } from './gallery/medias/medias.component';
import { GalleryDocumentComponent } from './gallery/document/document.component';
import { LeftSlideGalleryComponent } from './gallery/gallery.component';
import { AppinfosLeftSlideComponent } from './appinfos/appinfos.component';
import { LeftSlideBackmapComponent } from './backmap/backmap.component';
import { LeftSlideAddBackLayerComponent } from './backmap/addbacklayer/addbacklayer.component';
import { LeftSlideCacheComponent } from './backmap/cache/cache.component';
import { LeftSlideCraftlayersComponent } from './craftlayers/craftlayers.component';
import { LeftSlideDisponibleLayersComponent } from './craftlayers/disponible/disponible.component';
import { ColorModalComponent } from './craftlayers/color-modal/color-modal.component';
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
    AppinfosLeftSlideComponent, AppsettingsLeftSlideComponent, LeftSlideSynchronisationComponent,
    LeftSlideGalleryComponent, GalleryDocumentComponent, GalleryMediasComponent,
    LeftSlideBackmapComponent, LeftSlideAddBackLayerComponent, LeftSlideCacheComponent,
    ArraySortPipe, LeftSlideTronconComponent, LeftSlideCraftlayersComponent, ColorModalComponent,
    LeftSlideDisponibleLayersComponent],
  exports: [LeftSlideComponent]
})
export class LeftSlideModule {}
