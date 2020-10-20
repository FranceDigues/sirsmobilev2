import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GalleryDocumentComponent } from './document/document.component';
import { LeftSlideGalleryComponent } from './gallery.component';
import { GalleryMediasComponent } from './medias/medias.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  providers: [
  ],
  declarations: [
    LeftSlideGalleryComponent,
    GalleryDocumentComponent,
    GalleryMediasComponent
  ],
  exports: [LeftSlideGalleryComponent]
})
export class GalleryModule {}
