import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefSortPipe } from "./ref-sort.pipe";

@NgModule({
  declarations: [RefSortPipe],
  exports: [RefSortPipe],
  imports: [CommonModule]
})
export class RefSortPipeModule {}
