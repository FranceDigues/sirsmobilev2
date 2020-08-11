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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
  ],
  providers: [
    OLService,
    Geolocation,
    GeolocService,
    MapService,
    RealPositionStyle,
    EditionModeService
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
