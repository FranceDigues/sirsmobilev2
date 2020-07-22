import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatabaseConnectionPageRoutingModule } from './database-connection-routing.module';

import { DatabaseConnectionPage } from './database-connection.page';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddDatabaseComponent } from './add-database/add-database.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DatabaseConnectionPageRoutingModule,
    FlexLayoutModule,
  ],
  declarations: [DatabaseConnectionPage, AddDatabaseComponent]
})
export class DatabaseConnectionPageModule {}
