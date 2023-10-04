import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OLService } from './ol.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    OLService
  ],
  exports: [ OLService ]
})
export class LibMapModule { }
