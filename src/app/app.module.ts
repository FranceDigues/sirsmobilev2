import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { LibCameraModule } from '@ionic-lib/lib-camera/camera.module';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppVersionsService } from './appversions.service';
import { AuthService } from './auth.service';
import { BackLayerService } from './backlayer.service';
import { DatabaseConnectionPageModule } from './database-connection/database-connection.module';
import { DatabaseService } from './database.service';
import { EditionModeService } from './editionmode.service';
import { EditObjectService } from './editobjects.service';
import { FormsTemplateService } from './formstemplate.service';
import { GalleryService } from './gallery.service';
import { GlobalConfigService } from './globalconfig.service';
import { AppLayer, BackLayer, EditionLayer, GeolocLayer } from './layers.service';
import { MapService } from './map.service';
import { MapEditObjectService } from './mapeditobject.service';
import { ObjectDetails } from './objectdetails.service';
import { ObjectDocService } from './objectdoc.service';
import { SelectedObjectsService } from './selectedobjects.service';
import { SirsDocService } from './sirsdoc.service';
import { FilterPipe } from './sliders/right/createobjects/createobjects.component';
import { DefaultStyle, GetStyle, HandlingStyle, RealPositionStyle } from './style.service';
import { SyncService } from './sync.service';
import { AppTronconsService, DigueController, SystemeEndiguement, TronconController } from './troncon.service';
import { File } from '@ionic-native/file/ngx';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, MatIconModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule, BrowserAnimationsModule
  , HttpClientModule, DatabaseConnectionPageModule, LibCameraModule, NgbCollapseModule, FlexLayoutModule ],
  providers: [
    StatusBar,
    OLService,
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
    Toast,
    SelectedObjectsService,
    ObjectDetails,
    MapEditObjectService,
    FormsTemplateService,
    File,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
