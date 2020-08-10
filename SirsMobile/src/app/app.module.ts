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
import { LibMapModule } from '@lib-map/map.module';
import { LibCameraModule } from '@lib-camera/camera.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { EditionModeService } from './editionmode.service';
import { GetStyle, RealPositionStyle } from './style.service';
import { SyncService } from './sync.service';
import { DatabaseService } from './database.service';
import { AuthService } from './auth.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, MatIconModule, IonicModule.forRoot(), AppRoutingModule, BrowserAnimationsModule
  , HttpClientModule, DatabaseConnectionPageModule, LibCameraModule],
  providers: [
    StatusBar,
    SplashScreen,
    NativeStorage,
    Insomnia,
    Geolocation,
    EditionModeService,
    RealPositionStyle,
    GetStyle,
    SyncService,
    DatabaseService,
    AuthService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
