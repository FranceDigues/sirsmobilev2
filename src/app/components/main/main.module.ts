import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeolocationService } from '../../services/geolocation.service';
import { RealPositionStyle } from '../../services/style.service';
import { EditionModeService } from '../../services/edition-mode.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LeftPanelModule } from '../left-panel/left-panel.module';
import { RightPanelModule } from '../right-panel/right-panel.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    NgbCollapseModule,
    MatIconModule,
    FlexLayoutModule,
    LeftPanelModule, RightPanelModule
  ],
  providers: [
    Geolocation,
    RealPositionStyle,
    EditionModeService
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
