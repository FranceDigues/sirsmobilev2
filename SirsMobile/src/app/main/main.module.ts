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
    EditionModeService
  ],
  declarations: [MainPage, LeftSlideComponent, RightSlideComponent, LeftSlideMenuComponent,
    AppinfosLeftSlideComponent]
})
export class MainPageModule {}
