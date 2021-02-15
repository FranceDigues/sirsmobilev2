import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { LibCameraModule } from '@ionic-lib/lib-camera/camera.module';
import { OLService } from '@ionic-lib/lib-map/ol.service';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppVersionsService } from './services/app-versions.service';
import { AuthService } from './services/auth.service';
import { BackLayerService } from './services/back-layer.service';
import { CacheMapManager } from './services/cache.service';
import { DatabaseConnectionPageModule } from './components/database-connection/database-connection.module';
import { DatabaseService } from './services/database.service';
import { EditionModeService } from './services/edition-mode.service';
import { EditObjectService } from './services/edit-object.service';
import { FormsTemplateService } from './services/formstemplate.service';
import { ConfigService } from './services/config.service';
import { MapManagerService, BackLayer, GeolocLayer } from './services/map-manager.service';
import { MapService } from './services/map.service';
import { MapEditObjectService } from './services/map-edit-object.service';
import { ObjectDetails } from './services/object-details.service';
import { ObjectDocService } from './services/object-doc.service';
import { SelectedObjectsService } from './services/selected-objects.service';
import { SirsDocService } from './services/sirsdoc.service';
import { FilterPipe } from './components/right-panel/create-object/create-object.component';
import { DefaultStyle, GetStyle, HandlingStyle, RealPositionStyle } from './services/style.service';
import { SyncService } from './services/sync.service';
import { AppTronconsService, DigueController, SystemeEndiguement, TronconController } from './services/troncon.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ObservationEditService } from './services/observation-edit.service';
import { DirectiveModule } from './directives/directive.module';
import { PositionService } from './services/position.service';
import { ObjectEditModule } from './components/object-edit/object-edit.module';
import { Network } from '@ionic-native/network/ngx';
import { EditionLayerService } from './services/edition-layer.service';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule, MatIconModule,
        IonicModule.forRoot(), IonicStorageModule.forRoot(),
        AppRoutingModule, BrowserAnimationsModule, HttpClientModule,
        DatabaseConnectionPageModule, LibCameraModule,
        NgbCollapseModule, FlexLayoutModule, DirectiveModule,
        ObjectEditModule
    ],
    providers: [
        StatusBar, OLService, SplashScreen, NativeStorage,
        MapService, Insomnia, Geolocation, EditionModeService,
        RealPositionStyle, GetStyle, HandlingStyle, DefaultStyle,
        MapManagerService, GeolocLayer, EditionLayerService, BackLayer,
        SyncService, DatabaseService, AuthService, ConfigService,
        AppVersionsService, SirsDocService, BackLayerService,
        BackLayer, SystemeEndiguement, AppTronconsService, DigueController,
        TronconController, ObjectDocService, FilterPipe, EditObjectService,
        Toast, SelectedObjectsService, ObjectDetails, MapEditObjectService,
        FormsTemplateService, CacheMapManager, File, WebView, FileOpener,
        ObservationEditService, PositionService, Network,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
