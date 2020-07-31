import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Camera } from '@ionic-native/camera/ngx';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    Camera,
  ]
})
export class LibCameraModule { }
