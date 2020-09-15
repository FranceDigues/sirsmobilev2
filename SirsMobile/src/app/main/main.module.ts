import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeolocService } from '../geoloc.service';
import { RealPositionStyle } from '../style.service';
import { EditionModeService } from '../editionmode.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SirsDocService } from '../sirsdoc.service';
import { LeftSlideModule } from '../sliders/left/left-slide.module';
import { RightSlideModule } from '../sliders/right/right-slide.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    NgbCollapseModule,
    MatIconModule,
    FlexLayoutModule,
    LeftSlideModule, RightSlideModule
  ],
  providers: [
    Geolocation,
    GeolocService,
    RealPositionStyle,
    EditionModeService,
    SirsDocService
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
