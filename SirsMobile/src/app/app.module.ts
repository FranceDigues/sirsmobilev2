import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { DatabaseConnectionPageModule } from './database-connection/database-connection.module';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { LibCameraModule } from '@lib-camera/camera.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { EditionModeService } from './editionmode.service';
import { DefaultStyle, GetStyle, HandlingStyle, RealPositionStyle } from './style.service';
import { SyncService } from './sync.service';
import { DatabaseService } from './database.service';
import { AuthService } from './auth.service';
import { AppLayer, EditionLayer, GeolocLayer, BackLayer } from './layers.service';
import { IonicStorageModule } from '@ionic/storage';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GlobalConfigService } from './globalconfig.service';
import { AppVersionsService } from './appversions.service';
import { SirsDocService } from './sirsdoc.service';
import { GalleryService } from './gallery.service';
import { BackLayerService } from './backlayer.service';
import { AppTronconsService, DigueController, SystemeEndiguement, TronconController } from './troncon.service';
import { MapService } from './map.service';
import { ObjectDocService } from './objectdoc.service';
import { NgInitDirective } from './ng-init.directive';
import { FilterPipe } from './sliders/right/createobjects/createobjects.component';
import { EditObjectService } from './editobjects.service';
import { LeftSlideModule } from './sliders/left/left-slide.module';
import { RightSlideModule } from './sliders/right/right-slide.module';
import { ObjectEditPosByBorneController } from './sliders/right/editobjects/editobjects.component';

@NgModule({
  declarations: [AppComponent, NgInitDirective],
  entryComponents: [],
  imports: [BrowserModule, MatIconModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule, BrowserAnimationsModule
  , HttpClientModule, DatabaseConnectionPageModule, LibCameraModule, NgbCollapseModule, FlexLayoutModule],
  providers: [
    StatusBar,
    SplashScreen,
    NativeStorage,
    MapService,
    Insomnia,
    Geolocation,
    EditionModeService,
    RealPositionStyle,
    GetStyle,
    HandlingStyle,
    DefaultStyle,
    AppLayer,
    GeolocLayer,
    EditionLayer,
    BackLayer,
    SyncService,
    DatabaseService,
    AuthService,
    GlobalConfigService,
    AppVersionsService,
    SirsDocService,
    GalleryService,
    BackLayerService,
    BackLayer,
    SystemeEndiguement,
    AppTronconsService,
    DigueController,
    TronconController,
    ObjectDocService,
    FilterPipe,
    EditObjectService,
    ObjectEditPosByBorneController,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
