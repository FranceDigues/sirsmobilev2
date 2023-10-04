import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicStorageModule } from '@ionic/storage';
import { StorageService } from './storage.service';
import { NativeStorageService } from './nativestorage.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    NativeStorageService,
    StorageService
  ]
})
export class AsModule { }
