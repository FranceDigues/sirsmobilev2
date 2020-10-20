import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeftSlideCacheComponent } from './cache.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  providers: [
  ],
  declarations: [LeftSlideCacheComponent],
  exports: [LeftSlideCacheComponent]
})
export class CacheModule {}
