import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { CameraService } from '../lib-camera/camera.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
  ],
  providers: [
    CameraService
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
