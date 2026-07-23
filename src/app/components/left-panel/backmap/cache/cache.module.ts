import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeftSlideCacheComponent } from './cache.component';
import {AndroidPermissions} from "@ionic-native/android-permissions/ngx";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  providers: [
    AndroidPermissions
  ],
  declarations: [LeftSlideCacheComponent],
  exports: [LeftSlideCacheComponent]
})
export class CacheModule {}
