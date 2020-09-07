import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { OLService } from '@lib-map/ol.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeolocService } from '../geoloc.service';
import { MapService } from '../map.service';
import { RealPositionStyle } from '../style.service';
import { EditionModeService } from '../editionmode.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LeftSlideComponent } from '../sliders/left/left.component';
import { RightSlideComponent } from '../sliders/right/right.component';
import { LeftSlideMenuComponent } from '../sliders/left/menu/menu.component';
import { AppinfosLeftSlideComponent } from '../sliders/left/appinfos/appinfos.component';
import { AppsettingsLeftSlideComponent } from '../sliders/left/appsettings/appsettings.component';
import { DatabaseService } from '../database.service';
import { LeftSlideSynchronisationComponent } from '../sliders/left/synchronisation/synchronisation.component';
import { SirsDocService } from '../sirsdoc.service';
import { LeftSlideGalleryComponent } from '../sliders/left/gallery/gallery.component';
import { GalleryDocumentComponent } from '../sliders/left/gallery/document/document.component';
import { GalleryMediasComponent } from '../sliders/left/gallery/medias/medias.component';
import { LeftSlideBackmapComponent } from '../sliders/left/backmap/backmap.component';
import { LeftSlideAddBackLayerComponent } from '../sliders/left/backmap/addbacklayer/addbacklayer.component';
import { LeftSlideCacheComponent } from '../sliders/left/backmap/cache/cache.component';
import { ArraySortPipe, LeftSlideTronconComponent } from '../sliders/left/troncon/troncon.component';
import { LeftSlideCraftlayersComponent } from '../sliders/left/craftlayers/craftlayers.component';
import { ModalComponent } from '../sliders/left/craftlayers/modal/modal.component';
import { LeftSlideDisponibleLayersComponent } from '../sliders/left/craftlayers/disponible/disponible.component';
import { FilterPipe, RightSlideCreateObjectsComponent } from '../sliders/right/createobjects/createobjects.component';
import { RightSlideEditObjectsComponent, LonLatPipe, ObjectEditPosByBorneController } from '../sliders/right/createobjects/editobjects/editobjects.component';
import { FormsTemplateComponent } from '../sliders/right/createobjects/editobjects/forms-template/forms-template.component';
import { DesordreComponent, RefSortPipe } from '../sliders/right/createobjects/editobjects/forms-template/desordre/desordre.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    NgbCollapseModule,
    MatIconModule,
    FlexLayoutModule,
  ],
  providers: [
    OLService,
    Geolocation,
    GeolocService,
    RealPositionStyle,
    EditionModeService,
    SirsDocService
  ],
  declarations: [MainPage, LeftSlideComponent, RightSlideComponent, LeftSlideMenuComponent,
    AppinfosLeftSlideComponent, AppsettingsLeftSlideComponent, LeftSlideSynchronisationComponent,
    LeftSlideGalleryComponent, GalleryDocumentComponent, GalleryMediasComponent,
    LeftSlideBackmapComponent, LeftSlideAddBackLayerComponent, LeftSlideCacheComponent,
    ArraySortPipe, LeftSlideTronconComponent, LeftSlideCraftlayersComponent, ModalComponent,
    LeftSlideDisponibleLayersComponent, RightSlideCreateObjectsComponent,
    RightSlideEditObjectsComponent, LonLatPipe, ObjectEditPosByBorneController,
    FormsTemplateComponent, DesordreComponent, FilterPipe, RefSortPipe]
})
export class MainPageModule {}
