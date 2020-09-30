import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Camera } from '@ionic-native/camera/ngx';
import { CameraService } from './camera.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    Camera,
    CameraService
  ]
})
export class LibCameraModule { }
