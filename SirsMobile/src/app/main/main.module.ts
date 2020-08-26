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
// import { File } from '@ionic-native/file/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    NgbCollapseModule,MatIconModule,
    FlexLayoutModule,
  ],
  providers: [
    OLService,
    Geolocation,
    GeolocService,
    MapService,
    RealPositionStyle,
    EditionModeService,
    DatabaseService,
    SirsDocService,
    // File,
  ],
  declarations: [MainPage, LeftSlideComponent, RightSlideComponent, LeftSlideMenuComponent,
    AppinfosLeftSlideComponent, AppsettingsLeftSlideComponent, LeftSlideSynchronisationComponent,
    LeftSlideGalleryComponent, GalleryDocumentComponent, GalleryMediasComponent,
    LeftSlideBackmapComponent, LeftSlideAddBackLayerComponent, LeftSlideCacheComponent]
})
export class MainPageModule {}
